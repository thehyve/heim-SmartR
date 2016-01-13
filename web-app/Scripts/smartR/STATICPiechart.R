categories <- SmartR.data.cohort1$categoricalVars
categories$concept <- sapply(strsplit(categories$concept, '\\\\'), function(split) { paste(tail(split, n=2), collapse='/') })
concepts <- categories$concept
uniq.concepts <- unique(concepts)
slices <- c() 
for (concept in uniq.concepts) {
	slices <- c(slices, sum(concepts == concept))
}
pct <- round(slices/sum(slices)*100)
lbls <- paste(uniq.concepts, pct) # add percents to labels 
lbls <- paste(lbls,"%",sep="") # ad % to labels 
pie(slices,labels = lbls, col=rainbow(length(lbls)), radius = 0.5)