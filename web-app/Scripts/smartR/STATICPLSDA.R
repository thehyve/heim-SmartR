if (! suppressMessages(require(reshape))) {
    stop("SmartR requires the R package 'reshape'")
}

if (! suppressMessages(require(pls))) {
    stop("SmartR requires the R package 'pls'")
}

if (! suppressMessages(require(ggplot2))) {
    stop("SmartR requires the R package 'pls'")
}

source("http://pastebin.com/raw.php?i=UyDBTA57")

data <- SmartR.data.cohort1$numericalVars
data$concept <- sapply(strsplit(data$concept, '\\\\'), function(split) { paste(tail(split, n=2), collapse='/') })
categories <- SmartR.data.cohort1$categoricalVars
categories$concept <- sapply(strsplit(categories$concept, '\\\\'), function(split) { paste(tail(split, n=2), collapse='/') })

concepts <- unique(data$concept)

df <- cast(data, patientID~concept)
df <- merge(df, categories, by='patientID')

tmp.data <- df[, 2:(length(concepts)+1)]
tmp.group <- as.factor(df$concept)
tmp.y <- matrix(as.numeric(tmp.group),ncol=1)

mods <- make.OSC.PLS.model(tmp.y, pls.data=tmp.data, comp=2, OSC.comp=1, validation = "LOO",method="oscorespls", cv.scale=TRUE, progress=FALSE)

plot.OSC.results(mods,plot="scores",groups=as.vector(tmp.group))
