package com.wipro.model;

import java.util.List;

import org.apache.pdfbox.text.TextPosition;

public class SpatialWord {
	
	private final String text;//text of the word i.e. the word
	private final float xCord;//x co-od of the left-most character
    private final float yCord;//y co-od of the left-most character
    private final float height; // height of left-most character, in display units
    private final float width; // width of all character in word i.e. width of the word
    private final float fontSize;// font-size of the left-most character
    private final int fontSizePt;// font-size in pt of the left-most character
    private final String fontName;// font-name e.g. Times New Roman
    private final boolean bold;// true if the word is bold
    private final boolean italic;//true if the word is italic
    private final boolean smallCaps;// true if the word is small-caps e.g. A(big)-RIZONA(small)
    private float smallCapsFontSize;// font-size of the 2nd character of small-caps word
    private final float widthOfSpace; // width of a space, in display units
   
    public SpatialWord( List<TextPosition> textPositions) {
    	this.text = constructWord( textPositions );
		this.xCord = textPositions.get(0).getX();
		this.yCord = textPositions.get(0).getY();
		this.height = textPositions.get(0).getHeight();
		this.width = calculateWidth( textPositions );
		this.fontSize = textPositions.get(0).getFontSize();
		this.fontSizePt = (int) textPositions.get(0).getFontSizeInPt();
		this.widthOfSpace = textPositions.get(0).getWidthOfSpace();
		
		//to set fontName, isBold, isItalic
		this.fontName = textPositions.get(0).getFont().getName().toUpperCase();
		if ( this.fontName.contains("ITALIC")) {
			this.italic = true;
		} else {
			this.italic = false;
		}
		if( this.fontName.contains("BOLD") ) {
			this.bold = true;
		} else {
			this.bold = false;
		}
		//end setting bold/italic
		
		//to set small-caps
		if( textPositions.size() > 1 && textPositions.get(1).getUnicode().equals( textPositions.get(1).getUnicode().toUpperCase() ) ) {
			if( textPositions.get(0).getFontSize() > textPositions.get(1).getFontSize()) {//that's small-caps
				//System.out.println("Is small caps: " + text);
				this.smallCaps = true;
				this.smallCapsFontSize = textPositions.get(1).getFontSize();
			} else {
				this.smallCaps = false;
			}
		} else {
			this.smallCaps = false;
		}
		
	}
    
    public SpatialWord( List<TextPosition> textPositions, boolean isSupSubScript) {
    	this.text = constructWord( textPositions );
		this.xCord = textPositions.get(0).getX();
		this.yCord = textPositions.get(0).getY();
		this.height = textPositions.get(0).getHeight();
		this.width = calculateWidth( textPositions );
		this.fontSize = textPositions.get(0).getFontSize();
		this.fontSizePt = (int) textPositions.get(0).getFontSizeInPt();
		this.widthOfSpace = textPositions.get(0).getWidthOfSpace();
		
		//to set fontName, isBold, isItalic
		this.fontName = textPositions.get(0).getFont().getName().toUpperCase();
		if ( this.fontName.contains("ITALIC")) {
			this.italic = true;
		} else {
			this.italic = false;
		}
		if( this.fontName.contains("BOLD") ) {
			this.bold = true;
		} else {
			this.bold = false;
		}
		//end setting bold/italic
		
		//to set small-caps
		if( textPositions.size() > 1 && textPositions.get(1).getUnicode().equals( textPositions.get(1).getUnicode().toUpperCase() ) ) {
			if( textPositions.get(0).getFontSize() > textPositions.get(1).getFontSize()) {//that's small-caps
				//System.out.println("Is small caps: " + text);
				this.smallCaps = true;
				this.smallCapsFontSize = textPositions.get(1).getFontSize();
			} else {
				this.smallCaps = false;
			}
		} else {
			this.smallCaps = false;
		}
	}

    
	/**
     * This will return the String representation of a word.
     * @param textPositions List<TextPosition> of all the characters of a word
     * @return concatenated characters as String 
     */
    private String constructWord(List<TextPosition> textPositions) {
		String text = "";
		for (TextPosition textPosition : textPositions) {
			//to skip characters: start-text(1), carriage-return(13)
			if( textPosition.getCharacterCodes()[0] != 1 && textPosition.getCharacterCodes()[0] != 13 )
				text += textPosition.getUnicode();
			
			if ( textPosition.getFont().isDamaged()) {
				System.out.println("Damaged font: " + text);
			}
		}
		return text;
	}

	/**
     * Calculates the width of a word by adding the widths of its characters.
     * @param textPositions An array of all the characters of the word.
     * @return calculated width of word.
     */
    private float calculateWidth(List<TextPosition> textPositions) {
		float width = 0.0f;
		for (TextPosition textPosition : textPositions) {
			width += textPosition.getWidth();
		}
		return width;
	}

    	
    @Override
	public String toString() {
		return "SpatialWord [text:" + text + ", xCord:" + xCord + ", yCord:" + yCord + ", isBold:" + bold + ", isItalic:" + italic + "]";
	}


	/**
     * This returns the text of the word.
     * @return The text content of the word. i.e. the word.
     */
    public String getText() {
		return text;
	}
    
    
    public float getSmallCapsFontSize() {
		return smallCapsFontSize;
	}

	/**
     * This will get the font size in pt.
     *
     * @return The font size in pt.
     */
	public int getFontSizePt() {
		return fontSizePt;
	}

	/**
     * This will return the width of the word.
     * @return The width of the word.
     */
	public float getWidth() {
		return width;
	}

	/**
     * This will get the x position of the character so that the upper left is 0,0.
     *
     * @return The x coordinate of the character.
     */
    public float getXCord()
    {
        return this.xCord;
    }
    
    /**
     * This will get the y position of the text, adjusted so that 0,0 is upper left
     *
     * @return The adjusted y coordinate of the character.
     */
    public float getYCord()
    {
        return this.yCord;
    }
    
    /**
     * This will get the height of all characters in this string.
     *
     * @return The height of all characters in this word.
     */
    public float getHeight()
    {
        return this.height;
    }
    
    /**
     * This will get the average font size of the word.
     *
     * @return The font size.
     */
    public float getFontSize()
    {
        return fontSize;
    }
    
    /**
     * This will get the width of a space character.
     *
     * @return The width of a space character.
     */
    public float getWidthOfSpace()
    {
        return widthOfSpace;
    }
    
    /**
     * 
     * @return The font-name
     */
	public String getFontName() {
		return fontName;
	}
	
	/**
	 * 
	 * @return true if word is bold. Otherwise, false.
	 */
	public boolean isBold() {
		return bold;
	}
	
	/**
	 * 
	 * @return true is word is italic. Otherwise, false.
	 */
	public boolean isItalic() {
		return italic;
	}

	/**
	 * 
	 * @return true if the word is small-caps
	 */
	public boolean isSmallCaps() {
		return smallCaps;
	}
    
    
}
