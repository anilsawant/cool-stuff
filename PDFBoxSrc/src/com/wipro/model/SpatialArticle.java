package com.wipro.model;

import java.util.List;

import com.wipro.core.Constants;

public class SpatialArticle {
	private final List<SpatialParagraph> paragraphs;
	private final String text;//text of the paragraph i.e. the paragraph literally
	
	public SpatialArticle(List<SpatialParagraph> spatialParagraphs) {
		this.paragraphs = spatialParagraphs;
		String articleText = "";
		for (int i = 0; i < spatialParagraphs.size(); i++) {
			if( i == (spatialParagraphs.size()-1)) {
				articleText += spatialParagraphs.get(i).getText();
			} else {
				//paraText += spatialParagraphs.get(i).getText() + Constants.LINE_SEPARATOR;
				articleText += spatialParagraphs.get(i).getText() + Constants.WORD_SEPARATOR;
			}
			
		}
		this.text = articleText;
	}

	@Override
	public String toString() {
		return "SpatialArticle [text=" + text + "]";
	}

	public String getText() {
		return text;
	}

	public List<SpatialParagraph> getParagraphs() {
		return paragraphs;
	}
	
}
