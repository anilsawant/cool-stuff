package com.wipro.core;

import java.util.HashMap;
import java.util.Map;

public class Constants {
	
	//used by SpatialDocumentBuilder and its model classes
	public static final String WORD_SEPARATOR = " ";
	public static final String LINE_SEPARATOR = System.getProperty("line.separator");// same as used by PDFTextStripper
	public static final float DROP_THRESHOLD = 6.0f;
	
	public static final Map<String,String> htmlMarkupCharacters = new HashMap<String,String>();
	static {
		htmlMarkupCharacters.put("&", "&amp;");
		htmlMarkupCharacters.put("<", "&lt;");
		htmlMarkupCharacters.put(">", "&gt;");
		htmlMarkupCharacters.put("'", "&#39;");//or "&apos;"
		htmlMarkupCharacters.put("\"", "&quot;");	
	}
}
