package com.wipro.core;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Writer;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageTree;
import org.apache.pdfbox.pdmodel.interactive.action.PDActionURI;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotation;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotationLink;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotationMarkup;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotationRubberStamp;

import com.wipro.model.SpatialArticle;
import com.wipro.model.SpatialDocument;
import com.wipro.model.SpatialDocumentBuilder;
import com.wipro.model.SpatialLine;
import com.wipro.model.SpatialPage;
import com.wipro.model.SpatialParagraph;
import com.wipro.model.SpatialWord;

public class SpatialDocBuilderTest {

	public static void main(String[] args) {

		// processPDF( new File("E://holmes/thomson-reuters/data-set/pdf/2016-1_CA-CV_15-0030.pdf") );

		generateAnnotationInfo4File(new File("E://holmes/thomson-reuters/data-set/pdf/test1.pdf"));
		//generateImageInfo4File( new File("E://holmes/thomson-reuters/data-set/pdf/test.pdf"));
		//generateSmallCapsInfo4File(new File("E://holmes/thomson-reuters/data-set/pdf/test.pdf"));
		
		//generateSmallCapsInfo4Folder(new File("E://holmes/thomson-reuters/data-set/pdf/"));
		//generateImageInfo4Folder(new File("E://holmes/thomson-reuters/data-set/pdf/"));
		//generateAnnotationInfo4Folder(new File("E://holmes/thomson-reuters/data-set/pdf/"));
	}

	public static void processPDF(File pdfFile) {
		try {
			PDDocument pdDocument = PDDocument.load(pdfFile);
			SpatialDocumentBuilder spatialDocumentBuilder = new SpatialDocumentBuilder();
			spatialDocumentBuilder.setDropThreshold(Constants.DROP_THRESHOLD);// paragraph
																				// threshold
			spatialDocumentBuilder.setStartPage(1);
			spatialDocumentBuilder.setEndPage(1);
			spatialDocumentBuilder.getText(pdDocument);// call to getText is the
														// entry point
			System.out.println("Total words processed = " + spatialDocumentBuilder.getTotalWordsProcessed());
			System.out.println("Total lines processed = " + spatialDocumentBuilder.getTotalLinesProcessed());
			SpatialDocument spatialDocument = spatialDocumentBuilder.getSpatialDocument();
			System.out.println("Number of pages = " + spatialDocument.getNumberOfPages() + "\n");
			Set<SpatialPage> spatialPages = spatialDocument.getSpatialPages();
			for (SpatialPage spatialPage : spatialPages) {
				List<SpatialArticle> articles = spatialPage.getArticles();
				for (SpatialArticle spatialArticle : articles) {
					List<SpatialParagraph> paragraphs = spatialArticle.getParagraphs();
					for (SpatialParagraph spatialParagraph : paragraphs) {
						List<SpatialLine> lines = spatialParagraph.getLines();
						for (SpatialLine spatialLine : lines) {
							List<SpatialWord> words = spatialLine.getWords();
							for (SpatialWord spatialWord : words) {
								System.out.println(spatialWord.getText() + " [xCord:" + spatialWord.getXCord()
										+ ", yCord:" + spatialWord.getYCord() + ", width:" + spatialWord.getWidth()
										+ ", height:" + spatialWord.getHeight() + "]");
							}
						}
					}
				}
			}
			pdDocument.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public static void generateSmallCapsInfo4Folder(File parentFolder) {
		File processedFolder = new File(parentFolder.getAbsolutePath() + "/processed/2.0.2.small-caps-info");
		processedFolder.mkdirs();

		if (parentFolder.isDirectory()) {
			File[] pdfFiles = parentFolder.listFiles();
			int pdfFilesCount = 0;
			for (File file : pdfFiles) {
				if (file.isFile()) {
					String fileName = file.getName();
					String fileType = fileName.substring(fileName.lastIndexOf(".") + 1);
					if (fileType.equals("pdf")) {
						System.out.println("Processing: " + file.getAbsolutePath());
						File outputTxt = new File(
								processedFolder + File.separator + file.getName().replace(".pdf", "-small-caps.txt"));
						try {
							PDDocument pdDocument = PDDocument.load(file);
							SpatialDocumentBuilder spatialDocumentBuilder = new SpatialDocumentBuilder();
							spatialDocumentBuilder.setDropThreshold(Constants.DROP_THRESHOLD);// paragraph
																								// threshold
							spatialDocumentBuilder.setStartPage(1);
							// spatialDocumentBuilder.setEndPage(1);
							//call to getText is the entry point
							spatialDocumentBuilder.getText(pdDocument);

							Writer writer = new PrintWriter(outputTxt, "utf-8");
							writer.write("Total words processed = " + spatialDocumentBuilder.getTotalWordsProcessed()
									+ "\n");
							writer.write("Total lines processed = " + spatialDocumentBuilder.getTotalLinesProcessed()
									+ "\n");
							SpatialDocument spatialDocument = spatialDocumentBuilder.getSpatialDocument();
							writer.write("Number of pages = " + spatialDocument.getNumberOfPages() + "\n");
							String tab = "    ";
							Set<SpatialPage> spatialPages = spatialDocument.getSpatialPages();
							for (SpatialPage spatialPage : spatialPages) {
								writer.write("Page " + spatialPage.getPageNumber() + " : \n");
								List<SpatialArticle> articles = spatialPage.getArticles();
								for (SpatialArticle spatialArticle : articles) {
									List<SpatialParagraph> paragraphs = spatialArticle.getParagraphs();
									for (SpatialParagraph spatialParagraph : paragraphs) {
										List<SpatialLine> lines = spatialParagraph.getLines();
										for (SpatialLine spatialLine : lines) {
											List<SpatialWord> words = spatialLine.getWords();
											float previousSmallCapsFontSize = 0.0f;
											int wordCount = 0;
											for (SpatialWord spatialWord : words) {
												wordCount++;
												if (previousSmallCapsFontSize == 0.0f) {
													if (spatialWord.isSmallCaps()) {
														previousSmallCapsFontSize = spatialWord.getSmallCapsFontSize();
														writer.write("Small Caps start: \n");
													}
													if (previousSmallCapsFontSize != 0.0f)
														writer.write(tab + spatialWord.getText() + " [isSmallCaps: "
																+ spatialWord.isSmallCaps() + ", fontSize:"
																+ spatialWord.getFontSize() + "]\n");

												} else {
													if (spatialWord.isSmallCaps()
															|| (previousSmallCapsFontSize == spatialWord.getFontSize()
																	&& spatialWord.getText().equals(
																			spatialWord.getText().toUpperCase()))) {
														writer.write(tab + spatialWord.getText() + " [isSmallCaps: "
																+ spatialWord.isSmallCaps() + ", fontSize:"
																+ spatialWord.getFontSize() + "]\n");
														if (wordCount == words.size()) {
															writer.write("Small Caps END. \n");
															previousSmallCapsFontSize = 0.0f;
														}
													} else {
														writer.write("Small Caps END. \n");
														previousSmallCapsFontSize = 0.0f;
													}
												}
											}
										}
									}
								}
							}
							pdDocument.close();
							writer.close();
							System.out.println("Successfully generated: " + outputTxt.getAbsolutePath());
							pdfFilesCount++;
						} catch (IOException e) {
							e.printStackTrace();
						}
					}
				}
			}
			System.out.println("Successfully completed generating image info for " + pdfFilesCount + " HTML files.");
			pdfFilesCount++;
		}
	}
	
	public static void generateSmallCapsInfo4File(File file) {
				if (file.isFile()) {
					String fileName = file.getName();
					String fileType = fileName.substring(fileName.lastIndexOf(".") + 1);
					if (fileType.equals("pdf")) {
						System.out.println("Processing: " + file.getAbsolutePath());
						try {
							PDDocument pdDocument = PDDocument.load(file);
							SpatialDocumentBuilder spatialDocumentBuilder = new SpatialDocumentBuilder();
							spatialDocumentBuilder.setDropThreshold(Constants.DROP_THRESHOLD);// paragraph
																								// threshold
							spatialDocumentBuilder.setStartPage(1);
							// spatialDocumentBuilder.setEndPage(1);
							
							//call to getText is the entry point
							spatialDocumentBuilder.getText(pdDocument);


							System.out.println("Total words processed = " + spatialDocumentBuilder.getTotalWordsProcessed());
							System.out.println("Total lines processed = " + spatialDocumentBuilder.getTotalLinesProcessed());
							SpatialDocument spatialDocument = spatialDocumentBuilder.getSpatialDocument();
							System.out.println("Number of pages = " + spatialDocument.getNumberOfPages());
							String tab = "    ";
							boolean smallCapsFound = false;
							Set<SpatialPage> spatialPages = spatialDocument.getSpatialPages();
							for (SpatialPage spatialPage : spatialPages) {
								System.out.println("Page " + spatialPage.getPageNumber());
								List<SpatialArticle> articles = spatialPage.getArticles();
								for (SpatialArticle spatialArticle : articles) {
									List<SpatialParagraph> paragraphs = spatialArticle.getParagraphs();
									for (SpatialParagraph spatialParagraph : paragraphs) {
										List<SpatialLine> lines = spatialParagraph.getLines();
										for (SpatialLine spatialLine : lines) {
											List<SpatialWord> words = spatialLine.getWords();
											float previousSmallCapsFontSize = 0.0f;
											int wordCount = 0;
											for (SpatialWord spatialWord : words) {
												wordCount++;
												if (previousSmallCapsFontSize == 0.0f) {
													if (spatialWord.isSmallCaps()) {
														smallCapsFound = true;
														previousSmallCapsFontSize = spatialWord.getSmallCapsFontSize();
														System.out.println("Small Caps start:");
													}
													if (previousSmallCapsFontSize != 0.0f)
														System.out.println(tab + spatialWord.getText() + " [isSmallCaps: "
																+ spatialWord.isSmallCaps() + ", fontSize:"
																+ spatialWord.getFontSize() + "]");

												} else {
													if (spatialWord.isSmallCaps()
															|| (previousSmallCapsFontSize == spatialWord.getFontSize()
																	&& spatialWord.getText().equals(
																			spatialWord.getText().toUpperCase()))) {
														System.out.println(tab + spatialWord.getText() + " [isSmallCaps: "
																+ spatialWord.isSmallCaps() + ", fontSize:"
																+ spatialWord.getFontSize() + "]");
														if (wordCount == words.size()) {
															System.out.println("Small Caps END. ");
															previousSmallCapsFontSize = 0.0f;
														}
													} else {
														System.out.println("Small Caps END.");
														previousSmallCapsFontSize = 0.0f;
													}
												}
											}
										}
									}
								}
							}
							if ( !smallCapsFound ) {
								System.out.println("Small-caps not found in the doc.");
							}
							pdDocument.close();
						} catch (IOException e) {
							e.printStackTrace();
						}
					}
				}
	}

	public static void generateImageInfo4Folder(File parentFolder) {
		File processedFolder = new File(parentFolder.getAbsolutePath() + "/processed/2.0.2.embedded-image-info");
		processedFolder.mkdirs();

		if (parentFolder.isDirectory()) {
			File[] pdfFiles = parentFolder.listFiles();
			int pdfFilesCount = 0;
			for (File file : pdfFiles) {
				if (file.isFile()) {
					String fileName = file.getName();
					String fileType = fileName.substring(fileName.lastIndexOf(".") + 1);
					if (fileType.equals("pdf")) {
						System.out.println("Processing: " + file.getAbsolutePath());
						File outputTxt = new File(
								processedFolder + File.separator + file.getName().replace(".pdf", "-image-info.txt"));
						try {
							PDDocument pdDocument = PDDocument.load(file);
							SpatialDocumentBuilder spatialDocumentBuilder = new SpatialDocumentBuilder();
							spatialDocumentBuilder.setDropThreshold(Constants.DROP_THRESHOLD);// paragraph
																								// threshold
							spatialDocumentBuilder.setStartPage(1);
							// spatialDocumentBuilder.setEndPage(1);
							
							// call to getText is the entry point
							spatialDocumentBuilder.getText(pdDocument);

							Writer writer = new PrintWriter(outputTxt, "utf-8");
							writer.write("Total words processed = " + spatialDocumentBuilder.getTotalWordsProcessed()
									+ "\n");
							writer.write("Total lines processed = " + spatialDocumentBuilder.getTotalLinesProcessed()
									+ "\n");
							SpatialDocument spatialDocument = spatialDocumentBuilder.getSpatialDocument();
							writer.write("Number of pages = " + spatialDocument.getNumberOfPages() + "\n");
							String tab = "    ";
							Set<SpatialPage> spatialPages = spatialDocument.getSpatialPages();
							for (SpatialPage spatialPage : spatialPages) {
								writer.write("Page " + spatialPage.getPageNumber() + " : ");
								List<Float[]> embeddedImages = spatialPage.getEmbeddedImageRectangles();
								if (embeddedImages != null && !embeddedImages.isEmpty()) {
									writer.write("has " + embeddedImages.size() + " embedded image(s).\n");
									for (Float[] imageProps : embeddedImages) {
										writer.write(tab + "ImageProperties [" + imageProps[0] + ", " + imageProps[1]
												+ ", " + imageProps[2] + ", " + imageProps[3] + "]\n");
									}
								} else {
									writer.write("\n");
								}
							}
							pdDocument.close();
							writer.close();
							System.out.println("Successfully generated: " + outputTxt.getAbsolutePath());
							pdfFilesCount++;
						} catch (IOException e) {
							e.printStackTrace();
						}
					}
				}
			}
			System.out.println("Successfully completed generating image info for " + pdfFilesCount + " HTML files.");
			pdfFilesCount++;
		}
	}

	public static void generateImageInfo4File(File file) {
		if (file.isFile()) {
			String fileName = file.getName();
			String fileType = fileName.substring(fileName.lastIndexOf(".") + 1);
			if (fileType.equals("pdf")) {
				System.out.println("Processing: " + file.getAbsolutePath());
				try {
					PDDocument pdDocument = PDDocument.load(file);
					SpatialDocumentBuilder spatialDocumentBuilder = new SpatialDocumentBuilder();
					spatialDocumentBuilder.setDropThreshold(Constants.DROP_THRESHOLD);// paragraph
																						// threshold
					spatialDocumentBuilder.setStartPage(1);
					// spatialDocumentBuilder.setEndPage(1);
					
					// call to getText is the entry point
					spatialDocumentBuilder.getText(pdDocument);

					System.out.println("Total words processed = " + spatialDocumentBuilder.getTotalWordsProcessed() );
					System.out.println("Total lines processed = " + spatialDocumentBuilder.getTotalLinesProcessed() );
					SpatialDocument spatialDocument = spatialDocumentBuilder.getSpatialDocument();
					System.out.println("Number of pages = " + spatialDocument.getNumberOfPages());
					String tab = "    ";
					Set<SpatialPage> spatialPages = spatialDocument.getSpatialPages();
					boolean imgFound = false;
					for (SpatialPage spatialPage : spatialPages) {
						System.out.println("Page " + spatialPage.getPageNumber() + " : ");
						List<Float[]> embeddedImages = spatialPage.getEmbeddedImageRectangles();
						if (embeddedImages != null && !embeddedImages.isEmpty()) {
							imgFound = true;
							System.out.println("has " + embeddedImages.size() + " embedded image(s).");
							for (Float[] imageProps : embeddedImages) {
								System.out.println(tab + "ImageProperties [" + imageProps[0] + ", " + imageProps[1] + ", "
										+ imageProps[2] + ", " + imageProps[3] + "]");
							}
						} else {
							System.out.println();
						}
					}
					if (!imgFound) {
						System.out.println("No embedded images were found.");
					}
					pdDocument.close();
					System.out.println("Done!!");
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
	}

	public static void generateAnnotationInfo4Folder(File parentFolder) {
		File processedFolder = new File(parentFolder.getAbsolutePath() + "/processed/2.0.2.annotations");
		processedFolder.mkdirs();

		if (parentFolder.isDirectory()) {
			File[] pdfFiles = parentFolder.listFiles();
			int pdfFilesCount = 0;
			for (File file : pdfFiles) {
				if (file.isFile()) {
					String fileName = file.getName();
					String fileType = fileName.substring(fileName.lastIndexOf(".") + 1);
					if (fileType.equals("pdf")) {
						System.out.println("Processing: " + file.getAbsolutePath());
						File outputTxt = new File(
								processedFolder + File.separator + file.getName().replace(".pdf", "-annotations.txt"));
						try {
							Writer writer = new PrintWriter(outputTxt, "utf-8");
							PDDocument pdDocument = PDDocument.load(file);
							SpatialDocumentBuilder spatialDocumentBuilder = new SpatialDocumentBuilder();
							spatialDocumentBuilder.setDropThreshold(Constants.DROP_THRESHOLD);// paragraph
																								// threshold
							spatialDocumentBuilder.setStartPage(1);
							// spatialDocumentBuilder.setEndPage(1);
							
							// call to getText is the entry point
							spatialDocumentBuilder.getText(pdDocument);

							writer.write("Total words processed = " + spatialDocumentBuilder.getTotalWordsProcessed()
									+ "\n");
							writer.write("Total lines processed = " + spatialDocumentBuilder.getTotalLinesProcessed()
									+ "\n");
							SpatialDocument spatialDocument = spatialDocumentBuilder.getSpatialDocument();
							writer.write("Number of pages = " + spatialDocument.getNumberOfPages() + "\n");
							Set<SpatialPage> spatialPages = spatialDocument.getSpatialPages();
							String tab = "    ";
							for (SpatialPage page : spatialPages) {
								List<PDAnnotation> annotations = page.getAnnotations();
								writer.write("Annotations found on page " + page.getPageNumber() + " : "
										+ annotations.size() + "\n");
								int annotCount = 0;
								for (PDAnnotation pdAnnotation : annotations) {
									writer.write("Annotaion " + (++annotCount) + ": \n");
									writer.write("Annotation Subtype : " + pdAnnotation.getSubtype() + "\n");
									writer.write("Annotation Name: " + pdAnnotation.getAnnotationName() + "\n");
									writer.write("Modified Date : " + pdAnnotation.getModifiedDate() + "\n");

									if (pdAnnotation.getSubtype().equals("Stamp")) {
										PDAnnotationRubberStamp annot = (PDAnnotationRubberStamp) pdAnnotation;
										writer.write(tab + "Title/Subject: " + annot.getTitlePopup() + "\n");
										writer.write(tab + "Name: " + annot.getName() + "\n");
										writer.write(tab + "Contents: " + annot.getContents() + "\n");
										writer.write(tab + "Rectangle: " + annot.getRectangle() + "\n");
										writer.write(tab + "Creation Date: "
												+ new Date(annot.getCreationDate().getTimeInMillis()) + "\n");
									} else if (pdAnnotation.getSubtype().equals("Link")) {
										PDAnnotationLink annot = (PDAnnotationLink) pdAnnotation;
										PDActionURI prevURI = annot.getPreviousURI();
										float[] points = annot.getQuadPoints();
										writer.write(tab + "Action type: " + annot.getAction().getType() + "\n");
										writer.write(tab + "Name: " + annot.getHighlightMode() + "\n");
										writer.write(tab + "HighlightMode: " + annot.getContents() + "\n");
										writer.write(tab + "Rectangle: " + annot.getRectangle() + "\n");
										writer.write(tab + "prevURI: " + prevURI + "\n");
										if (points != null && points.length == 4)
											writer.write(tab + "Quad Points: [" + points[0] + "," + points[1] + ","
													+ points[2] + "," + points[3] + "\n");
									} else if (pdAnnotation.getSubtype().equals("FreeText")) {
										PDAnnotationMarkup annot = (PDAnnotationMarkup) pdAnnotation;
										writer.write(tab + "Title/Subject: " + annot.getTitlePopup() + "\n");
										writer.write(tab + "Intent: " + annot.getIntent() + "\n");
										writer.write(tab + "Rich Contents: " + annot.getRichContents() + "\n");
										writer.write(tab + "Contents: " + annot.getContents() + "\n");
										writer.write(tab + "Rectangle: " + annot.getRectangle() + "\n");
										writer.write(tab + "Creation Date: "
												+ new Date(annot.getCreationDate().getTimeInMillis()) + "\n");
									} else if (pdAnnotation.getSubtype().equals("Highlight")) {
										PDAnnotationMarkup annot = (PDAnnotationMarkup) pdAnnotation;
										writer.write(tab + "Title/Subject: " + annot.getTitlePopup() + "\n");
										writer.write(tab + "Intent: " + annot.getIntent() + "\n");
										writer.write(tab + "Rich Contents: " + annot.getRichContents() + "\n");
										writer.write(tab + "Contents: " + annot.getContents() + "\n");
										writer.write(tab + "Rectangle: " + annot.getRectangle() + "\n");
										writer.write(tab + "Creation Date: "
												+ new Date(annot.getCreationDate().getTimeInMillis()) + "\n");
									}
									writer.write("\n");
								}
							}
							writer.close();
							pdDocument.close();
							System.out.println("Successfully generated: " + outputTxt.getAbsolutePath());
							pdfFilesCount++;
						} catch (IOException e1) {
							e1.printStackTrace();
						}
					}
				}
			}
			System.out.println(
					"Successfully completed generating annotations info for " + pdfFilesCount + " HTML files.");

		}
	}
	
	public static void generateAnnotationInfo4File(File file) {
		if (file.isFile()) {
			String fileName = file.getName();
			String fileType = fileName.substring(fileName.lastIndexOf(".") + 1);
			if (fileType.equals("pdf")) {
				System.out.println("Processing: " + file.getAbsolutePath());
				try {
					PDDocument pdDocument = PDDocument.load(file);
					SpatialDocumentBuilder spatialDocumentBuilder = new SpatialDocumentBuilder();
					spatialDocumentBuilder.setDropThreshold(Constants.DROP_THRESHOLD);// paragraph
																						// threshold
					spatialDocumentBuilder.setStartPage(1);
					// spatialDocumentBuilder.setEndPage(1);

					// call to getText is the entry point
					spatialDocumentBuilder.getText(pdDocument);

					System.out.println(
							"Total words processed = " + spatialDocumentBuilder.getTotalWordsProcessed());
					System.out.println(
							"Total lines processed = " + spatialDocumentBuilder.getTotalLinesProcessed());
					SpatialDocument spatialDocument = spatialDocumentBuilder.getSpatialDocument();
					System.out.println("Number of pages = " + spatialDocument.getNumberOfPages());
					Set<SpatialPage> spatialPages = spatialDocument.getSpatialPages();
					String tab = "    ";
					for (SpatialPage page : spatialPages) {
						List<PDAnnotation> annotations = page.getAnnotations();
						System.out.println("Annotations found on page " + page.getPageNumber() + " : "
								+ annotations.size());
						int annotCount = 0;
						for (PDAnnotation pdAnnotation : annotations) {
							System.out.println("Annotaion :" + (++annotCount));
							System.out.println("Annotation Subtype : " + pdAnnotation.getSubtype());
							System.out.println("Annotation Name: " + pdAnnotation.getAnnotationName());
							System.out.println("Modified Date : " + pdAnnotation.getModifiedDate());

							if (pdAnnotation.getSubtype().equals("Stamp")) {
								PDAnnotationRubberStamp annot = (PDAnnotationRubberStamp) pdAnnotation;
								System.out.println(tab + "Title/Subject: " + annot.getTitlePopup());
								System.out.println(tab + "Name: " + annot.getName());
								System.out.println(tab + "Contents: " + annot.getContents());
								System.out.println(tab + "Rectangle: " + annot.getRectangle());
								System.out.println(tab + "Creation Date: "
										+ new Date(annot.getCreationDate().getTimeInMillis()));
							} else if (pdAnnotation.getSubtype().equals("Link")) {
								PDAnnotationLink annot = (PDAnnotationLink) pdAnnotation;
								PDActionURI prevURI = annot.getPreviousURI();
								float[] points = annot.getQuadPoints();
								System.out.println(tab + "Action type: " + annot.getAction().getType());
								System.out.println(tab + "Name: " + annot.getHighlightMode());
								System.out.println(tab + "HighlightMode: " + annot.getContents());
								System.out.println(tab + "Rectangle: " + annot.getRectangle());
								System.out.println(tab + "prevURI: " + prevURI);
								if (points != null && points.length == 4)
									System.out.println(tab + "Quad Points: [" + points[0] + "," + points[1] + ","
											+ points[2] + "," + points[3] + "]");
							} else if (pdAnnotation.getSubtype().equals("FreeText")) {
								PDAnnotationMarkup annot = (PDAnnotationMarkup) pdAnnotation;
								System.out.println(tab + "Title/Subject: " + annot.getTitlePopup());
								System.out.println(tab + "Intent: " + annot.getIntent());
								System.out.println(tab + "Rich Contents: " + annot.getRichContents());
								System.out.println(tab + "Contents: " + annot.getContents());
								System.out.println(tab + "Rectangle: " + annot.getRectangle());
								System.out.println(tab + "Creation Date: "
										+ new Date(annot.getCreationDate().getTimeInMillis()));
							} else if (pdAnnotation.getSubtype().equals("Highlight")) {
								PDAnnotationMarkup annot = (PDAnnotationMarkup) pdAnnotation;
								System.out.println(tab + "Title/Subject: " + annot.getTitlePopup());
								System.out.println(tab + "Intent: " + annot.getIntent());
								System.out.println(tab + "Rich Contents: " + annot.getRichContents());
								System.out.println(tab + "Contents: " + annot.getContents());
								System.out.println(tab + "Rectangle: " + annot.getRectangle());
								System.out.println(tab + "Creation Date: "
										+ new Date(annot.getCreationDate().getTimeInMillis()));
							}
							System.out.println();
						}
					}
					pdDocument.close();
				} catch (IOException e1) {
					e1.printStackTrace();
				}
			}
		}
	}
}
