if (! suppressMessages(require(reshape))) {
    stop("SmartR requires the R package 'reshape'")
}

if (! suppressMessages(require(ggplot2))) {
    stop("SmartR requires the R package 'ggplot2'")
}

## require(devtools)
## install_github("ggbiplot", "vqv")

if (! suppressMessages(require(ggbiplot))) {
    stop("SmartR requires the R package 'ggbiplot'")
}

data <- SmartR.data.cohort1$numericalVars
categories <- SmartR.data.cohort1$categoricalVars
concepts <- unique(data$concept)
df <- cast(data, patientID~concept)
df <- merge(df, categories, by='patientID')
df <- na.omit(df)

ir <- df[, 2:(length(concepts)+1)]
ir.species <- as.factor(df$concept)
ir.pca <- prcomp(ir, center = TRUE, scale. = TRUE)


g <- ggbiplot(ir.pca, obs.scale = 1, var.scale = 1, 
              groups = ir.species, ellipse = TRUE, 
              circle = TRUE)
g <- g + scale_color_discrete(name = '')
g <- g + theme(legend.direction = 'horizontal', 
               legend.position = 'top')
print(g)