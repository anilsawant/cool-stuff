package com.wipro.core;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Writer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.pdfbox.pdmodel.PDDocument;

import com.wipro.model.SpatialArticle;
import com.wipro.model.SpatialDocument;
import com.wipro.model.SpatialDocumentBuilder;
import com.wipro.model.SpatialLine;
import com.wipro.model.SpatialPage;
import com.wipro.model.SpatialParagraph;
import com.wipro.model.SpatialWord;

public class PdfToHtmlOwn {
	
	public void generateHTML(File pdfFile, File outputHtml) {

		try {
			System.out.println("Processing: " + pdfFile.getAbsolutePath() );
			PDDocument pdDocument = PDDocument.load(pdfFile);
			SpatialDocumentBuilder spatialDocumentBuilder = new SpatialDocumentBuilder();
			spatialDocumentBuilder.setDropThreshold( Constants.DROP_THRESHOLD );// paragraph threshold
			spatialDocumentBuilder.setStartPage(1);
			//spatialDocumentBuilder.setEndPage(1);
			spatialDocumentBuilder.getText(pdDocument);// call to getText is the entry point
			SpatialDocument spatialDocument = spatialDocumentBuilder.getSpatialDocument() ;
			
			Writer writer = new PrintWriter( outputHtml, "utf-8" );
			String tab = "    ";
			String head = "<!doctype html>\n"
					+ "<html>\n" 
					+ tab + "<head>\n"
					+ tab + tab + "<title>" + outputHtml.getName().replace(".html", "") + "</title>\n"
					+ tab + tab + "<meta charset='utf-8'>\n"
					+ tab + tab + "<style>\n"
					+ tab + tab + tab + "page{background-color:white;display:block;position:relative;border:1px solid #888;margin:5px auto;border-radius:4px;}\n"
					+ tab + tab + tab + "word{display:block; position:absolute;}\n"
					+ tab + tab + tab + "body{background-color:#333;}\n"
					+ tab + tab + tab + ".metaData{background-color: lightgreen;border:1px solid #888;border-radius:6px;font-family:courier;margin-bottom:5px;text-align:center;}\n"
					+ tab + tab + "</style>\n"
					+ tab + "</head>\n";
			String body = tab + "<body>\n";
			String metaData = tab + tab + "<div class='metaData'>\n"
					+ tab + tab + tab + "<h3>METADATA: Pages = " + spatialDocument.getNumberOfPages() + ", Lines = " + spatialDocumentBuilder.getTotalLinesProcessed() + ", Words = " + spatialDocumentBuilder.getTotalWordsProcessed() + "</h3>\n"
					+ tab + tab + "</div>\n";
			writer.write( head );
			writer.write( body );
			writer.write( metaData );
			Set<SpatialPage> spatialPages = spatialDocument.getSpatialPages();
			for (SpatialPage spatialPage: spatialPages) {
				writer.write(tab + tab + "<page style='height:" + (int)spatialPage.getHeight() + "pt;width:" + (int)spatialPage.getWidth() + "pt;'" + ">\n");
				List<SpatialArticle> articles = spatialPage.getArticles();
				for (SpatialArticle spatialArticle : articles) {
					writer.write(  tab + tab + tab + "<article>\n");
					List<SpatialParagraph> paragraphs = spatialArticle.getParagraphs();
					for (SpatialParagraph spatialParagraph : paragraphs) {
						writer.write( tab + tab + tab + tab + "<p>\n");
						List<SpatialLine> spatialLines = spatialParagraph.getLines();
						for (SpatialLine spatialLine : spatialLines) {
							writer.write( tab + tab + tab + tab + tab + "<line>\n");
							List<SpatialWord> spatialWords = spatialLine.getWords();
							for (SpatialWord spatialWord : spatialWords) {
								String fontStyleOpen = "", fontStyleClose = "";
								if( spatialWord.isBold() || spatialWord.isItalic()) {
									if (spatialWord.isBold()) {
										fontStyleOpen += "<b>";
										fontStyleClose += "</b>";
									}
									if (spatialWord.isItalic()) {
										fontStyleOpen += "<i>";
										fontStyleClose = "</i>" + fontStyleClose;
									}
								}
								writer.write( tab + tab + tab + tab + tab + tab +  "<word style='left:" + (int)spatialWord.getXCord() + "pt;top:" + (int)spatialWord.getYCord()+ "pt;'>" + fontStyleOpen + escapeMarkupCharacters(spatialWord.getText()) + fontStyleClose + "</word>"+ "\n");
							}
							writer.write( tab + tab + tab + tab + tab + "</line>\n");
						}
						writer.write( tab + tab + tab + tab + "</p>\n");
					}
					writer.write( tab + tab + tab + "</article>\n");
				}
				writer.write(tab + tab + "</page>\n");
			}
			writer.write( tab + "</body>\n</html>" );
			writer.close();
			pdDocument.close();// always remember to close the document
			System.out.println( "Successfully generated: " + outputHtml.getAbsolutePath());
		} catch (IOException e) {
			//e.printStackTrace();
			System.err.println(e.getMessage());
			System.err.println("ERROR: Failed to generate " + outputHtml.getName() );
		}
	}

	private static String escapeMarkupCharacters(String text) {
		Pattern pattern = Pattern.compile("(&|<|>|'|\")");
		Matcher matcher = pattern.matcher(text);
		StringBuffer sb = new StringBuffer();
		while( matcher.find() ) {
			String replacement = Constants.htmlMarkupCharacters.get(matcher.group(1));
			if ( replacement != null )
				matcher.appendReplacement(sb, replacement);
		}
		matcher.appendTail(sb);
		return sb.toString();
	}
}
