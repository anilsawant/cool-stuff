package com.wipro.model;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.io.StringWriter;
import java.text.Bidi;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;
import java.util.regex.Pattern;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;
import org.apache.pdfbox.text.TextPositionComparator;
import org.apache.pdfbox.util.QuickSort;

import com.wipro.model.SpatialArticle;
import com.wipro.model.SpatialDocument;
import com.wipro.model.SpatialLine;
import com.wipro.model.SpatialPage;
import com.wipro.model.SpatialParagraph;
import com.wipro.model.SpatialWord;

/**
 * This class is a copy of PDFTextStripper written by Ben Litchfield. It is used
 * to create a Spatial representation of a PDF document
 * 
 * @author AN303936
 */
public class SpatialDocumentBuilder extends PDFTextStripper {
	
	private final List<SpatialWord> spatialWords = new ArrayList<SpatialWord>();
	private final List<SpatialLine> spatialLines = new ArrayList<SpatialLine>();
	//private final List<SpatialParagraph> spatialPragraphs = new ArrayList<SpatialParagraph>();
	//private final List<SpatialArticle> spatialArticles = new ArrayList<SpatialArticle>();
	//private final List<SpatialPage> spatialPages = new ArrayList<SpatialPage>();
	
	//these temporary data stores are essential
	private SpatialParagraph tempSpatialParagraph;
	private List<SpatialLine> tempSpatialLinesPerPara;
	private SpatialArticle tempSpatialArticle;
	private List<SpatialParagraph> tempSpatialParagraphsPerArticle;
	private SpatialPage tempSpatialPage;
	private List<SpatialArticle> tempSpatialArticlesPerPage;
	private SpatialDocument spatialDocument;
	
	
	
	public SpatialDocument getSpatialDocument() {
		return spatialDocument;
	}
	
	public int getTotalWordsProcessed() {
		return this.spatialWords.size();
	}
	
	public int getTotalLinesProcessed() {
		return this.spatialLines.size();
	}
	
	public SpatialDocumentBuilder() throws IOException {
		super();
	}

	private static final Log LOG = LogFactory.getLog(PDFTextStripper.class);
	private static Map<Character, Character> MIRRORING_CHAR_MAP = new HashMap<Character, Character>();

	static {
		String path = "org/apache/pdfbox/resources/text/BidiMirroring.txt";
		InputStream input = PDFTextStripper.class.getClassLoader().getResourceAsStream(path);
		try {
			parseBidiFile(input);
		} catch (IOException e) {
			LOG.warn("Could not parse BidiMirroring.txt, mirroring char map will be empty: " + e.getMessage());
		} finally {
			try {
				input.close();
			} catch (IOException e) {
				LOG.error("Could not close BidiMirroring.txt ", e);
			}
		}
	};

	private static final boolean useCustomQuickSort;

	static {
		// check if we need to use the custom quicksort algorithm as a
		// workaround to the PDFBOX-1512 transitivity issue of
		// TextPositionComparator:
		boolean is16orLess = false;
		try {
			String version = System.getProperty("java.specification.version");
			StringTokenizer st = new StringTokenizer(version, ".");
			int majorVersion = Integer.parseInt(st.nextToken());
			int minorVersion = 0;
			if (st.hasMoreTokens()) {
				minorVersion = Integer.parseInt(st.nextToken());
			}
			is16orLess = majorVersion == 1 && minorVersion <= 6;
		} catch (SecurityException x) {
			// when run in an applet ignore and use default
			// assume 1.7 or higher so that quicksort is used
		} catch (NumberFormatException nfe) {
			// should never happen, but if it does,
			// assume 1.7 or higher so that quicksort is used
		}
		useCustomQuickSort = !is16orLess;
	}

	/**
	 * This method parses the bidi file provided as inputstream.
	 * 
	 * @param inputStream
	 *            - The bidi file as inputstream
	 * @throws IOException
	 *             if any line could not be read by the LineNumberReader
	 */
	private static void parseBidiFile(InputStream inputStream) throws IOException {
		LineNumberReader rd = new LineNumberReader(new InputStreamReader(inputStream));

		do {
			String s = rd.readLine();
			if (s == null) {
				break;
			}

			int comment = s.indexOf('#'); // ignore comments
			if (comment != -1) {
				s = s.substring(0, comment);
			}

			if (s.length() < 2) {
				continue;
			}

			StringTokenizer st = new StringTokenizer(s, ";");
			int nFields = st.countTokens();
			Character[] fields = new Character[nFields];
			for (int i = 0; i < nFields; i++) {
				fields[i] = (char) Integer.parseInt(st.nextToken().trim(), 16);
			}

			if (fields.length == 2) {
				// initialize the MIRRORING_CHAR_MAP
				MIRRORING_CHAR_MAP.put(fields[0], fields[1]);
			}

		} while (true);
	}
	
	
	/**
     * This will return the text of a document. See writeText. <br />
     * NOTE: The document must not be encrypted when coming into this method.
     *
     * @param doc The document to get the text from.
     * @return The text of the PDF document.
     * @throws IOException if the doc state is invalid or it is encrypted.
     */
	public String getText(PDDocument doc) throws IOException {
		
		this.spatialDocument = new SpatialDocument( doc.getNumberOfPages() );
		
		StringWriter outputStream = new StringWriter();
		writeText(doc, outputStream);
		return outputStream.toString();
	}
    
	private static final float END_OF_LAST_TEXT_X_RESET_VALUE = -1;
	private static final float MAX_Y_FOR_LINE_RESET_VALUE = -Float.MAX_VALUE;
	private static final float EXPECTED_START_OF_NEXT_WORD_X_RESET_VALUE = -Float.MAX_VALUE;
	private static final float MAX_HEIGHT_FOR_LINE_RESET_VALUE = -1;
	private static final float MIN_Y_TOP_FOR_LINE_RESET_VALUE = Float.MAX_VALUE;
	private static final float LAST_WORD_SPACING_RESET_VALUE = -1;
    private boolean inParagraph;//True if a paragraph is started but haven't ended yet.
    
	/**
	 * This will print the text of the processed page to "output". It will
	 * estimate, based on the coordinates of the text, where newlines and word
	 * spacings should be placed. The text will be sorted only if that feature
	 * was enabled.
	 *
	 * @throws IOException
	 *             If there is an error writing the text.
	 */
	protected void writePage() throws IOException {
		float maxYForLine = MAX_Y_FOR_LINE_RESET_VALUE;
		float minYTopForLine = MIN_Y_TOP_FOR_LINE_RESET_VALUE;
		float endOfLastTextX = END_OF_LAST_TEXT_X_RESET_VALUE;
		float lastWordSpacing = LAST_WORD_SPACING_RESET_VALUE;
		float maxHeightForLine = MAX_HEIGHT_FOR_LINE_RESET_VALUE;
		PositionWrapper lastPosition = null;
		PositionWrapper lastLineStartPosition = null;

		boolean startOfPage = true; // flag to indicate start of page
		boolean startOfArticle;
		if (charactersByArticle.size() > 0) {
			writePageStart();
		}
		
		for (List<TextPosition> textList : charactersByArticle) {
			if (getSortByPosition()) {
				TextPositionComparator comparator = new TextPositionComparator();

				// because the TextPositionComparator is not transitive, but
				// JDK7+ enforces transitivity on comparators, we need to use
				// a custom quicksort implementation (which is slower,
				// unfortunately).
				if (useCustomQuickSort) {
					QuickSort.sort(textList, comparator);
				} else {
					Collections.sort(textList, comparator);
				}
			}

			Iterator<TextPosition> textIter = textList.iterator();

			startArticle();
			startOfArticle = true;

			// Now cycle through to print the text.
			// We queue up a line at a time before we print so that we can
			// convert
			// the line from presentation form to logical form (if needed).
			List<LineItem> line = new ArrayList<LineItem>();

			textIter = textList.iterator(); // start from the beginning again
			// PDF files don't always store spaces. We will need to guess where
			// we should add
			// spaces based on the distances between TextPositions.
			// Historically, this was done
			// based on the size of the space character provided by the font. In
			// general, this
			// worked but there were cases where it did not work. Calculating
			// the average character
			// width and using that as a metric works better in some cases but
			// fails in some cases
			// where the spacing worked. So we use both. NOTE: Adobe reader also
			// fails on some of
			// these examples.

			// Keeps track of the previous average character width
			float previousAveCharWidth = -1;
			tempSpatialLinesPerPara = new ArrayList<SpatialLine>();
			while (textIter.hasNext()) {
				TextPosition position = textIter.next();
				PositionWrapper current = new PositionWrapper(position);
				String characterValue = position.getUnicode();

				// Resets the average character width when we see a change in
				// font
				// or a change in the font size
				if (lastPosition != null && (position.getFont() != lastPosition.getTextPosition().getFont()
						|| position.getFontSize() != lastPosition.getTextPosition().getFontSize())) {
					previousAveCharWidth = -1;
				}

				float positionX;
				float positionY;
				float positionWidth;
				float positionHeight;

				// If we are sorting, then we need to use the text direction
				// adjusted coordinates, because they were used in the sorting.
				if (getSortByPosition()) {
					positionX = position.getXDirAdj();
					positionY = position.getYDirAdj();
					positionWidth = position.getWidthDirAdj();
					positionHeight = position.getHeightDir();
				} else {
					positionX = position.getX();
					positionY = position.getY();
					positionWidth = position.getWidth();
					positionHeight = position.getHeight();
				}

				// The current amount of characters in a word
				int wordCharCount = position.getIndividualWidths().length;

				// Estimate the expected width of the space based on the
				// space character with some margin.
				float wordSpacing = position.getWidthOfSpace();
				float deltaSpace;
				if (wordSpacing == 0 || Float.isNaN(wordSpacing)) {
					deltaSpace = Float.MAX_VALUE;
				} else {
					if (lastWordSpacing < 0) {
						deltaSpace = wordSpacing * getSpacingTolerance();
					} else {
						deltaSpace = (wordSpacing + lastWordSpacing) / 2f * getSpacingTolerance();
					}
				}

				// Estimate the expected width of the space based on the average
				// character width
				// with some margin. This calculation does not make a true
				// average (average of
				// averages) but we found that it gave the best results after
				// numerous experiments.
				// Based on experiments we also found that .3 worked well.
				float averageCharWidth;
				if (previousAveCharWidth < 0) {
					averageCharWidth = positionWidth / wordCharCount;
				} else {
					averageCharWidth = (previousAveCharWidth + positionWidth / wordCharCount) / 2f;
				}
				float deltaCharWidth = averageCharWidth * getAverageCharTolerance();

				// Compares the values obtained by the average method and the
				// wordSpacing method
				// and picks the smaller number.
				float expectedStartOfNextWordX = EXPECTED_START_OF_NEXT_WORD_X_RESET_VALUE;
				if (endOfLastTextX != END_OF_LAST_TEXT_X_RESET_VALUE) {
					if (deltaCharWidth > deltaSpace) {
						expectedStartOfNextWordX = endOfLastTextX + deltaSpace;
					} else {
						expectedStartOfNextWordX = endOfLastTextX + deltaCharWidth;
					}
				}
				
				if (lastPosition != null) {
					if (startOfArticle) {
						lastPosition.setArticleStart();
						startOfArticle = false;
					}
					// RDD - Here we determine whether this text object is on
					// the current
					// line. We use the lastBaselineFontSize to handle the
					// superscript
					// case, and the size of the current font to handle the
					// subscript case.
					// Text must overlap with the last rendered baseline text by
					// at least
					// a small amount in order to be considered as being on the
					// same line.

					// XXX BC: In theory, this check should really check if the
					// next char is in
					// full range seen in this line. This is what I tried to do
					// with minYTopForLine,
					// but this caused a lot of regression test failures. So,
					// I'm leaving it be for
					// now
					if (!overlap(positionY, positionHeight, maxYForLine, maxHeightForLine)) {
						
						//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
						//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
						//code to create SpatialLine and SpatialWords
						List<SpatialWord> spatialWordsList = new ArrayList<SpatialWord>();
						List<TextPosition> textPosList = new ArrayList<TextPosition>();
						for (int i = 0; i < line.size(); i++) {
							TextPosition textPosition = line.get(i).getTextPosition();
							if( textPosition != null ){
								if( textPosition.getUnicode().equals(" ") || textPosition.getCharacterCodes()[0] == 32) {
									if( !textPosList.isEmpty() ) {
										SpatialWord spatialWord = new SpatialWord(textPosList);
										spatialWords.add(spatialWord);//this is temp. Remove it after creating doc-page-para-line hierarchy 
										spatialWordsList.add( spatialWord );
										textPosList = new ArrayList<TextPosition>();
									}
								} else if( (i+1) == line.size() ){
									textPosList.add( textPosition );
									if( !textPosList.isEmpty() ) {
										SpatialWord spatialWord = new SpatialWord(textPosList);
										spatialWords.add(spatialWord);//this is temp. Remove it after creating doc-page-para-line hierarchy 
										spatialWordsList.add( spatialWord );
										textPosList = new ArrayList<TextPosition>();
									}
								} else {
									textPosList.add( textPosition );
								}
							}
						}
						if( !spatialWordsList.isEmpty() ) {
							SpatialLine newSpatialLine = new SpatialLine(spatialWordsList);
							tempSpatialLinesPerPara.add( newSpatialLine );
							spatialLines.add( newSpatialLine );
						}
						// end section
						
						writeLine(normalize(line));
						line.clear();
						
						//new paragraph logic goes here
						lastLineStartPosition = handleLineSeparation(current, lastPosition, lastLineStartPosition,
								maxHeightForLine);
						expectedStartOfNextWordX = EXPECTED_START_OF_NEXT_WORD_X_RESET_VALUE;
						maxYForLine = MAX_Y_FOR_LINE_RESET_VALUE;
						maxHeightForLine = MAX_HEIGHT_FOR_LINE_RESET_VALUE;
						minYTopForLine = MIN_Y_TOP_FOR_LINE_RESET_VALUE;
					}
					// test if our TextPosition starts after a new word would be
					// expected to start
					if (expectedStartOfNextWordX != EXPECTED_START_OF_NEXT_WORD_X_RESET_VALUE
							&& expectedStartOfNextWordX < positionX &&
							// only bother adding a space if the last character
							// was not a space
							lastPosition.getTextPosition().getUnicode() != null
							&& !lastPosition.getTextPosition().getUnicode().endsWith(" ")) {
						line.add(LineItem.getWordSeparator());
					}
				}
				if (positionY >= maxYForLine) {
					maxYForLine = positionY;
				}
				// RDD - endX is what PDF considers to be the x coordinate of
				// the
				// end position of the text. We use it in computing our metrics
				// below.
				endOfLastTextX = positionX + positionWidth;

				// add it to the list
				if (characterValue != null) {
					
					if (startOfPage && lastPosition == null) {
						writeParagraphStart();// not sure this is correct for
												// RTL?
					}
					line.add(new LineItem(position));
				}
				maxHeightForLine = Math.max(maxHeightForLine, positionHeight);
				minYTopForLine = Math.min(minYTopForLine, positionY - positionHeight);
				lastPosition = current;
				if (startOfPage) {
					lastPosition.setParagraphStart();
					lastPosition.setLineStart();
					lastLineStartPosition = lastPosition;
					startOfPage = false;
				}
				lastWordSpacing = wordSpacing;
				previousAveCharWidth = averageCharWidth;
			}
			// print the final line
			if (line.size() > 0) {
				
				//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
				//code to create SpatialLine and SpatialWords
				List<SpatialWord> spatialWordsList = new ArrayList<SpatialWord>();
				List<TextPosition> textPosList = new ArrayList<TextPosition>();
				for (int i = 0; i < line.size(); i++) {
					TextPosition textPosition = line.get(i).getTextPosition();
					if( textPosition != null ) {
						if( textPosition.getUnicode().equals(" ") || textPosition.getCharacterCodes()[0] == 32) {
							if( !textPosList.isEmpty() ) {
								SpatialWord spatialWord = new SpatialWord(textPosList);
								spatialWords.add(spatialWord);//this is temp. Remove it after creating doc-page-para-line hierarchy 
								spatialWordsList.add( spatialWord );
								textPosList = new ArrayList<TextPosition>();
							}
						} else if( (i+1) == line.size() ){
							textPosList.add( textPosition );
							if( !textPosList.isEmpty() ) {
								SpatialWord spatialWord = new SpatialWord(textPosList);
								spatialWords.add(spatialWord);//this is temp. Remove it after creating doc-page-para-line hierarchy 
								spatialWordsList.add( spatialWord );
								textPosList = new ArrayList<TextPosition>();
							}
						} else {
							textPosList.add( textPosition );
						}
					}
					
				}
				if( !spatialWordsList.isEmpty()) {
					SpatialLine newSpatialLine = new SpatialLine(spatialWordsList);
					tempSpatialLinesPerPara.add( newSpatialLine );
					spatialLines.add( newSpatialLine );
				}
				// end section
				//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
				
				
				writeLine(normalize(line));
				writeParagraphEnd();
			}
			endArticle();
		}
		writePageEnd();
	}
	
	/**
     * Write the start of a page.
     * 
     * @throws IOException if something went wrong
     */
	protected void writePageStart() throws IOException {
		//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
		tempSpatialArticlesPerPage = new ArrayList<SpatialArticle>();
		//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
		output.write(getPageStart());
	}

	/**
	 * Write the end of a page.
	 * 
	 * @throws IOException
	 *             if something went wrong
	 */
	protected void writePageEnd() throws IOException {
		//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
		tempSpatialPage = new SpatialPage( tempSpatialArticlesPerPage, getCurrentPageNo(), getCurrentPage().getMediaBox().getHeight(), getCurrentPage().getMediaBox().getWidth() );// create a new SpatialArticle
		this.spatialDocument.addPage(tempSpatialPage);
		//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
		output.write(getPageEnd());
	}
    
	/**
	 * Start a new article,
	 *
	 * @throws IOException
	 *             If there is any error writing to the stream.
	 */
	protected void startArticle() throws IOException {
		//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
		tempSpatialParagraphsPerArticle = new ArrayList<SpatialParagraph>();
		//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
		startArticle(true);
	}

	/**
	 * End an article.
	 *
	 * @throws IOException
	 *             If there is any error writing to the stream.
	 */
	protected void endArticle() throws IOException {
		//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
		tempSpatialArticle = new SpatialArticle( tempSpatialParagraphsPerArticle );// create a new SpatialArticle
		tempSpatialArticlesPerPage.add(tempSpatialArticle);// create a new SpatialArticle
		//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
		output.write(getArticleEnd());
	}
    
	/**
	 * writes the paragraph separator string to the output.
	 * 
	 * @throws IOException
	 *             if something went wrong
	 */
	protected void writeParagraphSeparator() throws IOException {
		writeParagraphEnd();
		writeParagraphStart();
	}

	/**
	 * Write something (if defined) at the start of a paragraph.
	 * 
	 * @throws IOException
	 *             if something went wrong
	 */
	protected void writeParagraphStart() throws IOException {
		//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
		tempSpatialLinesPerPara = new ArrayList<SpatialLine>();
		//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
		
		if (inParagraph) {
			writeParagraphEnd();
			inParagraph = false;
		}
		output.write(getParagraphStart());
		inParagraph = true;
	}

	/**
	 * Write something (if defined) at the end of a paragraph.
	 * 
	 * @throws IOException
	 *             if something went wrong
	 */
	protected void writeParagraphEnd() throws IOException {
		
		//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
		//to skip empty paragraphs
		boolean isEmpty = false;
		for (SpatialLine line : tempSpatialLinesPerPara) {
			if ( line.getText().equals("") ) {
				isEmpty = true;
			} else {
				isEmpty = false;
				break;
			}
		}
		if (!isEmpty) {
			tempSpatialParagraph = new SpatialParagraph( tempSpatialLinesPerPara );// create a new SpatialParagraph
			tempSpatialParagraphsPerArticle.add(tempSpatialParagraph);//add the temp para to the article
		}
		//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
		
		if (!inParagraph) {
			writeParagraphStart();
		}
		output.write(getParagraphEnd());
		inParagraph = false;
	}
    
    
	private boolean overlap(float y1, float height1, float y2, float height2) {
		return within(y1, y2, .1f) || y2 <= y1 && y2 >= y1 - height1 || y1 <= y2 && y1 >= y2 - height2;
	}

	/**
	 * This will determine of two floating point numbers are within a specified
	 * variance.
	 *
	 * @param first
	 *            The first number to compare to.
	 * @param second
	 *            The second number to compare to.
	 * @param variance
	 *            The allowed variance.
	 */
	private boolean within(float first, float second, float variance) {
		return second < first + variance && second > first - variance;
	}

	/**
	 * Normalize the given list of TextPositions.
	 * 
	 * @param line
	 *            list of TextPositions
	 * @return a list of strings, one string for every word
	 */
	private List<WordWithTextPositions> normalize(List<LineItem> line) {
		List<WordWithTextPositions> normalized = new LinkedList<WordWithTextPositions>();
		StringBuilder lineBuilder = new StringBuilder();
		List<TextPosition> wordPositions = new ArrayList<TextPosition>();

		for (LineItem item : line) {
			lineBuilder = normalizeAdd(normalized, lineBuilder, wordPositions, item);
		}

		if (lineBuilder.length() > 0) {
			normalized.add(createWord(lineBuilder.toString(), wordPositions));
		}
		return normalized;
	}

	/**
	 * Write a list of string containing a whole line of a document.
	 * 
	 * @param line
	 *            a list with the words of the given line
	 * @throws IOException
	 *             if something went wrong
	 */
	private void writeLine(List<WordWithTextPositions> line) throws IOException {
		int numberOfStrings = line.size();
		for (int i = 0; i < numberOfStrings; i++) {
			WordWithTextPositions word = line.get(i);
			writeString(word.getText(), word.getTextPositions());
			if (i < numberOfStrings - 1) {
				writeWordSeparator();
			}
		}
	}

	/**
	 * Used within {@link #normalize(List, boolean, boolean)} to create a single
	 * {@link WordWithTextPositions} entry.
	 */
	private WordWithTextPositions createWord(String word, List<TextPosition> wordPositions) {
		return new WordWithTextPositions(normalizeWord(word), wordPositions);
	}

	/**
	 * handles the line separator for a new line given the specified current and
	 * previous TextPositions.
	 * 
	 * @param current
	 *            the current text position
	 * @param lastPosition
	 *            the previous text position
	 * @param lastLineStartPosition
	 *            the last text position that followed a line separator.
	 * @param maxHeightForLine
	 *            max height for positions since lastLineStartPosition
	 * @return start position of the last line
	 * @throws IOException
	 *             if something went wrong
	 */
	private PositionWrapper handleLineSeparation(PositionWrapper current, PositionWrapper lastPosition,
			PositionWrapper lastLineStartPosition, float maxHeightForLine) throws IOException {
		current.setLineStart();
		isParagraphSeparation(current, lastPosition, lastLineStartPosition, maxHeightForLine);
		lastLineStartPosition = current;
		if (current.isParagraphStart()) {
			if (lastPosition.isArticleStart()) {
				if (lastPosition.isLineStart()) {
					writeLineSeparator();
				}
				writeParagraphStart();
			} else {
				writeLineSeparator();
				writeParagraphSeparator();
			}
		} else {
			writeLineSeparator();
		}
		return lastLineStartPosition;
	}



	/**
	 * tests the relationship between the last text position, the current text
	 * position and the last text position that followed a line separator to
	 * decide if the gap represents a paragraph separation. This should
	 * <i>only</i> be called for consecutive text positions that first pass the
	 * line separation test.
	 * <p>
	 * This base implementation tests to see if the lastLineStartPosition is
	 * null OR if the current vertical position has dropped below the last text
	 * vertical position by at least 2.5 times the current text height OR if the
	 * current horizontal position is indented by at least 2 times the current
	 * width of a space character.
	 * </p>
	 * <p>
	 * This also attempts to identify text that is indented under a hanging
	 * indent.
	 * </p>
	 * <p>
	 * This method sets the isParagraphStart and isHangingIndent flags on the
	 * current position object.
	 * </p>
	 *
	 * @param position
	 *            the current text position. This may have its isParagraphStart
	 *            or isHangingIndent flags set upon return.
	 * @param lastPosition
	 *            the previous text position (should not be null).
	 * @param lastLineStartPosition
	 *            the last text position that followed a line separator, or
	 *            null.
	 * @param maxHeightForLine
	 *            max height for text positions since lasLineStartPosition.
	 */
	private void isParagraphSeparation(PositionWrapper position, PositionWrapper lastPosition,
			PositionWrapper lastLineStartPosition, float maxHeightForLine) {
		boolean result = false;
		if (lastLineStartPosition == null) {
			result = true;
		} else {
			float yGap = Math
					.abs(position.getTextPosition().getYDirAdj() - lastPosition.getTextPosition().getYDirAdj());
			float newYVal = multiplyFloat(getDropThreshold(), maxHeightForLine);
			// do we need to flip this for rtl?
			float xGap = position.getTextPosition().getXDirAdj() - lastLineStartPosition.getTextPosition().getXDirAdj();
			float newXVal = multiplyFloat(getIndentThreshold(), position.getTextPosition().getWidthOfSpace());
			float positionWidth = multiplyFloat(0.25f, position.getTextPosition().getWidth());

			if (yGap > newYVal) {
				result = true;
			} else if (xGap > newXVal) {
				// text is indented, but try to screen for hanging indent
				if (!lastLineStartPosition.isParagraphStart()) {
					result = true;
				} else {
					position.setHangingIndent();
				}
			} else if (xGap < -position.getTextPosition().getWidthOfSpace()) {
				// text is left of previous line. Was it a hanging indent?
				if (!lastLineStartPosition.isParagraphStart()) {
					result = true;
				}
			} else if (Math.abs(xGap) < positionWidth) {
				// current horizontal position is within 1/4 a char of the last
				// linestart. We'll treat them as lined up.
				if (lastLineStartPosition.isHangingIndent()) {
					position.setHangingIndent();
				} else if (lastLineStartPosition.isParagraphStart()) {
					// check to see if the previous line looks like
					// any of a number of standard list item formats
					Pattern liPattern = matchListItemPattern(lastLineStartPosition);
					if (liPattern != null) {
						Pattern currentPattern = matchListItemPattern(position);
						if (liPattern == currentPattern) {
							result = true;
						}
					}
				}
			}
		}
		if (result) {
			position.setParagraphStart();
		}
	}

	private float multiplyFloat(float value1, float value2) {
		// multiply 2 floats and truncate the resulting value to 3 decimal
		// places
		// to avoid wrong results when comparing with another float
		return Math.round(value1 * value2 * 1000) / 1000f;
	}

	/**
	 * returns the list item Pattern object that matches the text at the
	 * specified PositionWrapper or null if the text does not match such a
	 * pattern. The list of Patterns tested against is given by the
	 * {@link #getListItemPatterns()} method. To add to the list, simply
	 * override that method (if sub-classing) or explicitly supply your own list
	 * using {@link #setListItemPatterns(List)}.
	 * 
	 * @param pw
	 *            position
	 * @return the matching pattern
	 */
	private Pattern matchListItemPattern(PositionWrapper pw) {
		TextPosition tp = pw.getTextPosition();
		String txt = tp.getUnicode();
		return matchPattern(txt, getListItemPatterns());
	}

	/**
	 * Normalize certain Unicode characters. For example, convert the single
	 * "fi" ligature to "f" and "i". Also normalises Arabic and Hebrew
	 * presentation forms.
	 *
	 * @param word
	 *            Word to normalize
	 * @return Normalized word
	 */
	private String normalizeWord(String word) {
		StringBuilder builder = null;
		int p = 0;
		int q = 0;
		int strLength = word.length();
		for (; q < strLength; q++) {
			// We only normalize if the codepoint is in a given range.
			// Otherwise, NFKC converts too many things that would cause
			// confusion. For example, it converts the micro symbol in
			// extended Latin to the value in the Greek script. We normalize
			// the Unicode Alphabetic and Arabic A&B Presentation forms.
			char c = word.charAt(q);
			if (0xFB00 <= c && c <= 0xFDFF || 0xFE70 <= c && c <= 0xFEFF) {
				if (builder == null) {
					builder = new StringBuilder(strLength * 2);
				}
				builder.append(word.substring(p, q));
				// Some fonts map U+FDF2 differently than the Unicode spec.
				// They add an extra U+0627 character to compensate.
				// This removes the extra character for those fonts.
				if (c == 0xFDF2 && q > 0 && (word.charAt(q - 1) == 0x0627 || word.charAt(q - 1) == 0xFE8D)) {
					builder.append("\u0644\u0644\u0647");
				} else {
					// Trim because some decompositions have an extra space,
					// such as U+FC5E
					builder.append(Normalizer.normalize(word.substring(q, q + 1), Normalizer.Form.NFKC).trim());
				}
				p = q + 1;
			}
		}
		if (builder == null) {
			return handleDirection(word);
		} else {
			builder.append(word.substring(p, q));
			return handleDirection(builder.toString());
		}
	}

	/**
	 * Handles the LTR and RTL direction of the given words. The whole
	 * implementation stands and falls with the given word. If the word is a
	 * full line, the results will be the best. If the word contains of single
	 * words or characters, the order of the characters in a word or words in a
	 * line may wrong, due to RTL and LTR marks and characters!
	 * 
	 * Based on http://www.nesterovsky-bros.com/weblog/2013/07/28/
	 * VisualToLogicalConversionInJava.aspx
	 * 
	 * @param word
	 *            The word that shall be processed
	 * @return new word with the correct direction of the containing characters
	 */
	private String handleDirection(String word) {
		Bidi bidi = new Bidi(word, Bidi.DIRECTION_DEFAULT_LEFT_TO_RIGHT);

		// if there is pure LTR text no need to process further
		if (!bidi.isMixed() && bidi.getBaseLevel() == Bidi.DIRECTION_LEFT_TO_RIGHT) {
			return word;
		}

		// collect individual bidi information
		int runCount = bidi.getRunCount();
		byte[] levels = new byte[runCount];
		Integer[] runs = new Integer[runCount];

		for (int i = 0; i < runCount; i++) {
			levels[i] = (byte) bidi.getRunLevel(i);
			runs[i] = i;
		}

		// reorder individual parts based on their levels
		Bidi.reorderVisually(levels, 0, runs, 0, runCount);

		// collect the parts based on the direction within the run
		StringBuilder result = new StringBuilder();

		for (int i = 0; i < runCount; i++) {
			int index = runs[i];
			int start = bidi.getRunStart(index);
			int end = bidi.getRunLimit(index);

			int level = levels[index];

			if ((level & 1) != 0) {
				for (; --end >= start;) {
					char character = word.charAt(end);
					if (Character.isMirrored(word.codePointAt(end))) {
						if (MIRRORING_CHAR_MAP.containsKey(character)) {
							result.append(MIRRORING_CHAR_MAP.get(character));
						} else {
							result.append(character);
						}
					} else {
						result.append(character);
					}
				}
			} else {
				result.append(word, start, end);
			}
		}

		return result.toString();
	}

	/**
	 * Used within {@link #normalize(List, boolean, boolean)} to handle a
	 * {@link TextPosition}.
	 * 
	 * @return The StringBuilder that must be used when calling this method.
	 */
	private StringBuilder normalizeAdd(List<WordWithTextPositions> normalized, StringBuilder lineBuilder,
			List<TextPosition> wordPositions, LineItem item) {
		if (item.isWordSeparator()) {
			normalized.add(createWord(lineBuilder.toString(), new ArrayList<TextPosition>(wordPositions)));
			lineBuilder = new StringBuilder();
			wordPositions.clear();
		} else {
			TextPosition text = item.getTextPosition();
			lineBuilder.append(text.getUnicode());
			wordPositions.add(text);
		}
		return lineBuilder;
	}

	/**
	 * internal marker class. Used as a place holder in a line of TextPositions.
	 */
	private static final class LineItem {
		public static LineItem WORD_SEPARATOR = new LineItem();

		public static LineItem getWordSeparator() {
			return WORD_SEPARATOR;
		}

		private final TextPosition textPosition;

		private LineItem() {
			textPosition = null;
		}

		LineItem(TextPosition textPosition) {
			this.textPosition = textPosition;
		}

		public TextPosition getTextPosition() {
			return textPosition;
		}

		public boolean isWordSeparator() {
			return textPosition == null;
		}
	}

	/**
	 * Internal class that maps strings to lists of {@link TextPosition} arrays.
	 * Note that the number of entries in that list may differ from the number
	 * of characters in the string due to normalization.
	 *
	 * @author Axel Dörfler
	 */
	private static final class WordWithTextPositions {
		String text;
		List<TextPosition> textPositions;

		WordWithTextPositions(String word, List<TextPosition> positions) {
			text = word;
			textPositions = positions;
		}

		public String getText() {
			return text;
		}

		public List<TextPosition> getTextPositions() {
			return textPositions;
		}
	}

	/**
	 * wrapper of TextPosition that adds flags to track status as linestart and
	 * paragraph start positions.
	 * <p>
	 * This is implemented as a wrapper since the TextPosition class doesn't
	 * provide complete access to its state fields to subclasses. Also,
	 * conceptually TextPosition is immutable while these flags need to be set
	 * post-creation so it makes sense to put these flags in this separate
	 * class.
	 * </p>
	 * 
	 * @author m.martinez@ll.mit.edu
	 */
	private static final class PositionWrapper {
		private boolean isLineStart = false;
		private boolean isParagraphStart = false;
		private boolean isPageBreak = false;
		private boolean isHangingIndent = false;
		private boolean isArticleStart = false;

		private TextPosition position = null;

		/**
		 * Constructs a PositionWrapper around the specified TextPosition
		 * object.
		 *
		 * @param position
		 *            the text position.
		 */
		PositionWrapper(TextPosition position) {
			this.position = position;
		}

		/**
		 * Returns the underlying TextPosition object.
		 * 
		 * @return the text position
		 */
		public TextPosition getTextPosition() {
			return position;
		}

		public boolean isLineStart() {
			return isLineStart;
		}

		/**
		 * Sets the isLineStart() flag to true.
		 */
		public void setLineStart() {
			this.isLineStart = true;
		}

		public boolean isParagraphStart() {
			return isParagraphStart;
		}

		/**
		 * sets the isParagraphStart() flag to true.
		 */
		public void setParagraphStart() {
			this.isParagraphStart = true;
		}

		public boolean isArticleStart() {
			return isArticleStart;
		}

		/**
		 * Sets the isArticleStart() flag to true.
		 */
		public void setArticleStart() {
			this.isArticleStart = true;
		}

		public boolean isPageBreak() {
			return isPageBreak;
		}

		/**
		 * Sets the isPageBreak() flag to true.
		 */
		public void setPageBreak() {
			this.isPageBreak = true;
		}

		public boolean isHangingIndent() {
			return isHangingIndent;
		}

		/**
		 * Sets the isHangingIndent() flag to true.
		 */
		public void setHangingIndent() {
			this.isHangingIndent = true;
		}
	}
}