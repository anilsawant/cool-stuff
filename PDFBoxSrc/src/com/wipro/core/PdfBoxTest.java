package com.wipro.core;

import java.util.List;
import java.util.Set;
import java.io.File;
import java.io.IOException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import com.wipro.model.SpatialArticle;
import com.wipro.model.SpatialDocument;
import com.wipro.model.SpatialDocumentBuilder;
import com.wipro.model.SpatialLine;
import com.wipro.model.SpatialPage;
import com.wipro.model.SpatialParagraph;
import com.wipro.model.SpatialWord;

public class PdfBoxTest {

	public static void main(String[] args) {
		//processPDFFolder( new File("E://holmes/thomson-reuters/data-set/pdf/" ) );
		
		File pdfFile = new File("E://holmes/thomson-reuters/data-set/pdf/ddel tables.pdf");
		File outputHtml = new File( "E://holmes/thomson-reuters/data-set/pdf/" + pdfFile.getName().replace(".pdf", ".html"));
		try {
			PDDocument pdDocument = PDDocument.load(pdfFile);
			PDFTextStripper stripper = new PDFTextStripper();
			stripper.setStartPage(1);
			//stripper.setEndPage(4);
			stripper.getText(pdDocument);
			//System.out.println(stripper.getText(pdDocument));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		//processPDF( pdfFile );
		//PdfToHtmlBeta pdfToHtmlBeta = new PdfToHtmlBeta();
		//pdfToHtmlBeta.generateHTML(pdfFile,outputHtml);
	}
	
	public static void processPDFFolder( File parentFolder ) {
		File processedFolder = new File( parentFolder.getAbsolutePath() + "/processed/new");
		processedFolder.mkdirs();
		
		if( processedFolder.isDirectory() ) {
			File[] pdfFiles = parentFolder.listFiles();
			int pdfFilesCount = 0;
			for (File file : pdfFiles) {
				if( file.isFile() ) {
					String fileName = file.getName();
					String fileType = fileName.substring( fileName.lastIndexOf(".") + 1);
					if( fileType.equals("pdf") ) {
						File outputHtml = new File( processedFolder + File.separator + file.getName().replace(".pdf", ".html"));
						PdfToHtmlOwn pdfToHtmlBeta = new PdfToHtmlOwn();
						pdfToHtmlBeta.generateHTML(file,outputHtml);						
						pdfFilesCount++;
					}
				}
			}
			System.out.println("Successfully completed generating " + pdfFilesCount + " HTML files.");
		}
	}
	
	public static void processPDF( File pdfFile ) {
		try {
			PDDocument pdDocument = PDDocument.load(pdfFile);
			SpatialDocumentBuilder spatialDocumentBuilder = new SpatialDocumentBuilder();
			spatialDocumentBuilder.setDropThreshold( Constants.DROP_THRESHOLD );// paragraph threshold
			spatialDocumentBuilder.setStartPage(1);
			spatialDocumentBuilder.setEndPage(1);
			spatialDocumentBuilder.getText(pdDocument);// call to getText is the entry point
			
			System.out.println("\n");
			System.out.println("Total words processed = " + spatialDocumentBuilder.getTotalWordsProcessed() );
			System.out.println("Total lines processed = " + spatialDocumentBuilder.getTotalLinesProcessed() );
			SpatialDocument spatialDocument = spatialDocumentBuilder.getSpatialDocument() ;
			System.out.println("Number of pages = " + spatialDocument.getNumberOfPages());
			Set<SpatialPage> spatialPages = spatialDocument.getSpatialPages();
			for (SpatialPage spatialPage: spatialPages) {
				List<SpatialArticle> articles = spatialPage.getArticles();
				for (SpatialArticle spatialArticle : articles) {
					List<SpatialParagraph> paragraphs = spatialArticle.getParagraphs();
					for (SpatialParagraph spatialParagraph : paragraphs) {
						List<SpatialLine> lines = spatialParagraph.getLines();
						for (SpatialLine spatialLine : lines) {
							//System.out.println( spatialLine );
							//System.out.println("[ xCord: " + spatialLine.getXCord() + ", yCord: " + spatialLine.getYCord() + ", width: " + spatialLine.getWidth() + ", height: " + spatialLine.getHeight() + " ]");
							List<SpatialWord> words = spatialLine.getWords();
							for (SpatialWord spatialWord : words) {
								System.out.println(spatialWord);
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
	
	/*public static void processPDFFolder( File parentFolder ) {
		File processedFolder = new File( parentFolder.getAbsolutePath() + "/processed");
		processedFolder.mkdir();
		
		if( parentFolder.isDirectory() ) {
			File[] pdfFiles = parentFolder.listFiles();
			int pdfFilesCount = 0;
			for (File file : pdfFiles) {
				if( file.isFile() ) {
					String fileName = file.getName();
					String fileType = fileName.substring( fileName.lastIndexOf(".") + 1);
					if( fileType.equals("pdf") ) {
						pdfFilesCount++;
						try {
							PDDocument pdDocument = PDDocument.load(file);
							SpatialDocumentBuilder spatialDocumentBuilder = new SpatialDocumentBuilder();
							spatialDocumentBuilder.setDropThreshold(6.0f);// paragraph threshold
							spatialDocumentBuilder.setStartPage(1);
							spatialDocumentBuilder.getText(pdDocument);// call to getText is the entry point
							SpatialDocument spatialDocument = spatialDocumentBuilder.getSpatialDocument() ;
							
							Writer writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream( processedFolder + File.separator + fileName.replace(".pdf", "-metadata.txt"))));
							writer.write( "Total number of pages : " + spatialDocument.getNumberOfPages() + "\n" );
							writer.write( "Total words processed: " + spatialDocumentBuilder.getTotalWordsProcessed() + "\n");
							writer.write( "Total Lines processed: " + spatialDocumentBuilder.getTotalLinesProcessed() + "\n");
							writer.write("\n***Extracted elements of PDF***\n\n");
							
							String tab = "    ";
							writer.write("<document>\n");
							Set<SpatialPage> spatialPages = spatialDocument.getSpatialPages();
							for (SpatialPage spatialPage: spatialPages) {
								writer.write(tab + "<page>\n");
								List<SpatialArticle> articles = spatialPage.getArticles();
								for (SpatialArticle spatialArticle : articles) {
									writer.write( tab + tab + "<article>\n");
									List<SpatialParagraph> paragraphs = spatialArticle.getParagraphs();
									for (SpatialParagraph spatialParagraph : paragraphs) {
										writer.write( tab + tab + tab + "<p>" + spatialParagraph.getText() + "</p>\n");
									}
									writer.write( tab + tab + "</article>\n");
								}
								writer.write(tab + "</page>\n");
							}
							writer.write("</document>");
							writer.close();
							pdDocument.close();// always remember to close the document
							System.out.println("Processed file: " + fileName );
							
						} catch (IOException e) {
							e.printStackTrace();
						}
					}
				}
			}
			System.out.println("Successfully completed processing " + pdfFilesCount + " pdf files.");
		}
	}*/
}
