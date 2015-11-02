if (! suppressMessages(require(reshape))) {
    stop("SmartR requires the R package 'reshape'")
}
if (! suppressMessages(require(gplots))) {
    stop("SmartR requires the R package 'gplots'")
}
data <- SmartR.data.cohort1$numericVars
concepts <- unique(data$concept)
df <- cast(data, patientID~concept)
df <- cor(df[, -1], use='complete.obs', method=SmartR.settings$method)
colnames(df) <- concepts
rownames(df) <- concepts
heatmap.2(df,
		col=redgreen(500), 
		symkey=FALSE, 
		density.info="none", 
		trace="none", 
		scale="row",
		cexRow=1,
		cexCol=1,
		margins=c(40,40))