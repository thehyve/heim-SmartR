if (! suppressMessages(require(reshape2))) {
    stop("SmartR requires the R package 'reshape2'")
}

if (! suppressMessages(require(limma))) {
    stop("SmartR requires the R package 'limma'")
}

getHDDMatrix <- function(raw.data) {
    HDD.matrix <- data.frame(
        PATIENTID=raw.data$PATIENTID,
        PROBE=raw.data$PROBE,
        GENESYMBOL=raw.data$GENESYMBOL,
        VALUE=raw.data$VALUE)
    HDD.matrix <- melt(HDD.matrix, id=c('PATIENTID', 'PROBE', 'GENESYMBOL'), na.rm=TRUE)
    HDD.matrix <- data.frame(dcast(HDD.matrix, PROBE + GENESYMBOL ~ PATIENTID), stringsAsFactors=FALSE)
    # FIXME: implement
    # if (discardNullGenes) {
    #     HDD.matrix <- HDD.matrix[HDD.matrix$GENESYMBOL != '', ]
    # }
    HDD.matrix <- na.omit(HDD.matrix)
    HDD.matrix <- HDD.matrix[order(HDD.matrix$PROBE), ]
    HDD.matrix
}

extractMatrixValues <- function(HDD.matrix) {
    valueMatrix <- HDD.matrix[, -(1:2)]
    valueMatrix
}

HDD.value.matrix.cohort1 <- getHDDMatrix(data.cohort1$mRNAData)
HDD.value.matrix.cohort2 <- getHDDMatrix(data.cohort2$mRNAData)

HDD.value.matrix.cohort1 <- HDD.value.matrix.cohort1[HDD.value.matrix.cohort1$PROBE %in% HDD.value.matrix.cohort2$PROBE, ]
HDD.value.matrix.cohort2 <- HDD.value.matrix.cohort2[HDD.value.matrix.cohort2$PROBE %in% HDD.value.matrix.cohort1$PROBE, ]

valueMatrix.cohort1 <- extractMatrixValues(HDD.value.matrix.cohort1)
valueMatrix.cohort2 <- extractMatrixValues(HDD.value.matrix.cohort2)

valueMatrix <- cbind(valueMatrix.cohort1, valueMatrix.cohort2)
HDD.value.matrix <- cbind(HDD.value.matrix.cohort1[, 1:2], valueMatrix)

colNum <- ncol(HDD.value.matrix.cohort1) - 2
classVectorS1 <- c(rep(1, colNum), rep(2, ncol(valueMatrix) - colNum))
classVectorS2 <- rev(classVectorS1)
design <- cbind(S1=classVectorS1, S2=classVectorS2)
contrast.matrix = makeContrasts(S1-S2, levels=design)
fit <- lmFit(log2(valueMatrix), design)
fit <- contrasts.fit(fit, contrast.matrix)
fit <- eBayes(fit)
contr = 1
top.fit = data.frame(
        ID=rownames(fit$coefficients),
        logFC=fit$coefficients[, contr],
        t=fit$t[, contr],
        P.Value=fit$p.value[, contr],
        adj.P.val=p.adjust(p=fit$p.value[, contr], method='BH'),
        B=fit$lods[, contr]
)

pValues <- -log10(top.fit$P.Value)
logFCs <- top.fit$logFC
probes <- HDD.value.matrix$PROBE
geneSymbols <- HDD.value.matrix$GENESYMBOL

output$probes <- probes
output$geneSymbols <- geneSymbols
output$pValues <- pValues
output$logFCs <- logFCs
