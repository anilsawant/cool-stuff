package com.wipro.core;

import java.io.File;
import com.wipro.pdf2html.PdfToHtmlOwn;

public class Pdf2htmlOwnTest {

	public static void main(String[] args) {
		processPDFFolder( new File("E://holmes/thomson-reuters/data-set/pdf/" ) );
		//processPDF( new File("E://holmes/thomson-reuters/data-set/pdf/213840.pdf") );
	}
	
	public static void processPDFFolder( File parentFolder ) {
		File processedFolder = new File( parentFolder.getAbsolutePath() + "/processed/2.0.2-para-deep");
		processedFolder.mkdirs();
		
		if( parentFolder.isDirectory() ) {
			File[] pdfFiles = parentFolder.listFiles();
			int pdfFilesCount = 0;
			for (File file : pdfFiles) {
				if( file.isFile() ) {
					String fileName = file.getName();
					String fileType = fileName.substring( fileName.lastIndexOf(".") + 1);
					if( fileType.equals("pdf") ) {
						File outputHtml = new File( processedFolder + File.separator + file.getName().replace(".pdf", ".html"));
						PdfToHtmlOwn pdfToHtmlOwn = new PdfToHtmlOwn();
						pdfToHtmlOwn.generateHTMLParaDepth(file,outputHtml);						
						pdfFilesCount++;
					}
				}
			}
			System.out.println("Successfully completed generating " + pdfFilesCount + " HTML files.");
		}
	}
	
	public static void processPDF( File pdfFile ) {	
		File outputHtml = new File( pdfFile.getAbsolutePath().replace(".pdf", "-solo.html"));
		PdfToHtmlOwn pdfToHtmlOwn = new PdfToHtmlOwn();
		pdfToHtmlOwn.generateHTMLWordDepth(pdfFile,outputHtml);
	}
}
