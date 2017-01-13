package com.wipro.model;

import java.util.List;

import com.wipro.core.Constants;

public class SpatialParagraph {
	private final List<SpatialLine> lines;
	private final String text;//text of the paragraph i.e. the paragraph literally
	
	public SpatialParagraph(List<SpatialLine> spatialLines) {
		this.lines = spatialLines;
		String paraText = "";
		for (int i = 0; i < spatialLines.size(); i++) {
			if( i == (spatialLines.size()-1)) {
				paraText += spatialLines.get(i).getText();
			} else {
				//paraText += spatialLines.get(i).getText() + Constants.LINE_SEPARATOR;
				paraText += spatialLines.get(i).getText() + Constants.WORD_SEPARATOR;
			}
			
		}
		this.text = paraText;
	}
	
	@Override
	public String toString() {
		return "SpatialParagraph [text=" + text + "]";
	}
	
	public List<SpatialLine> getLines() {
		return lines;
	}

	public String getText() {
		return text;
	}
	
	
}
