package com.wipro.model;

import java.util.List;

import com.wipro.core.Constants;

public class SpatialLine {
	private final List<SpatialWord> words;
	private final String text;//text of the line i.e. the line literally
	private final float xCord;//x co-od of the left-most character
    private final float yCord;//y co-od of the left-most character
    private final float height; // height of left-most character, in display units
    private final float width; // width of all the words and spaces in line
	
	public SpatialLine(List<SpatialWord> spatialWords) {
		this.words = spatialWords;
		int spatialWordsSize = spatialWords.size();
		String lineText = "";
		for (int i = 0; i < spatialWordsSize; i++ ) {
			if( i == (spatialWordsSize-1) ) {//don't append wordSeparator at the end of line
				lineText += spatialWords.get(i).getText();
			} else {
				lineText += spatialWords.get(i).getText() + Constants.WORD_SEPARATOR ;
			}
		}
		this.text = lineText;
		this.xCord = spatialWords.get(0).getXCord();
		this.yCord = spatialWords.get(0).getYCord();
		this.width = spatialWords.get(spatialWordsSize - 1).getXCord() + spatialWords.get(spatialWordsSize - 1).getWidth() - spatialWords.get(0).getXCord();
		this.height = spatialWords.get(0).getHeight();
	}
	
	@Override
	public String toString() {
		return "SpatialLine [text: " + text + "]";
	}
	
	public List<SpatialWord> getWords() {
		return words;
	}

	public String getText() {
		return text;
	}

	public float getXCord() {
		return xCord;
	}

	public float getYCord() {
		return yCord;
	}

	public float getHeight() {
		return height;
	}

	public float getWidth() {
		return width;
	}

}
