package com.wipro.model;

import java.util.List;

import com.wipro.core.Constants;

public class SpatialPage implements Comparable<SpatialPage> {
	private final int pageNumber;
	private final double height;
	private final double width;
	private final List<SpatialArticle> articles;//holds all the newspaper-style articles(columns) of one page
	private final String text;
	
	public SpatialPage( List<SpatialArticle> spatialArticles, int pageNumber, double height, double width ) {
		this.articles = spatialArticles;
		this.pageNumber = pageNumber;
		this.height = height;
		this.width = width;
				
		String pageText = "";
		for (int i = 0; i < spatialArticles.size(); i++) {
			if( i == (spatialArticles.size()-1)) {
				pageText += spatialArticles.get(i).getText();
			} else {
				//paraText += spatialArticles.get(i).getText() + Constants.LINE_SEPARATOR;
				pageText += spatialArticles.get(i).getText() + Constants.WORD_SEPARATOR;
			}
			
		}
		this.text = pageText;
		
	}


	@Override
	public String toString() {
		return "SpatialPage [pageNumber=" + pageNumber + ", height=" + height + ", width=" + width + ", textLength=" + text.length()
				+ "]";
	}


	@Override
	public int compareTo(SpatialPage spatialPage) {
		return this.pageNumber - spatialPage.getPageNumber();
	}


	public int getPageNumber() {
		return pageNumber;
	}


	public double getHeight() {
		return height;
	}


	public double getWidth() {
		return width;
	}

	public List<SpatialArticle> getArticles() {
		return articles;
	}


	public String getText() {
		return text;
	}
	
	
}
