package com.wipro.model;

import java.util.Iterator;
import java.util.Set;
import java.util.TreeSet;

public class SpatialDocument {
	private final Set<SpatialPage> spatialPages = new TreeSet<SpatialPage>();;
	private final int numberOfPages;
	
	public SpatialDocument(int numberOfPages) {
		this.numberOfPages = numberOfPages;
	}
	
	/**
	 * Retrieves a page. pageNumber is zero based
	 * @param pageNumber
	 * @return SpatialPage or null
	 */
	public SpatialPage getPage( int pageNumber) {
		Iterator<SpatialPage> pageIterator = this.spatialPages.iterator();
		while( pageIterator.hasNext() ) {
			SpatialPage spatialPage = pageIterator.next();
			if( spatialPage.getPageNumber() == pageNumber )
				return spatialPage;
		}
		return null;
	}
	
	
	public Set<SpatialPage> getSpatialPages() {
		return spatialPages;
	}

	public int getNumberOfPages() {
		return numberOfPages;
	}


	/**
	 * 
	 * @param spatialPage
	 */
	public boolean addPage( SpatialPage spatialPage ) {
		return this.spatialPages.add( spatialPage );
	}
	
	/**
	 * 
	 * @param spatialPage
	 */
	public void removePage( SpatialPage spatialPage ) {
		this.spatialPages.remove( spatialPage );
	}
}
