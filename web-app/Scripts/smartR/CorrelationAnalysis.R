### PREPARE SETTINGS ###

method <- SmartR.settings$method
if (! is.null(SmartR.settings$xLow)) {
	xLow <- as.integer(SmartR.settings$xLow)
	xHigh <- as.integer(SmartR.settings$xHigh)
	yLow <- as.integer(SmartR.settings$yLow)
	yHigh <- as.integer(SmartR.settings$yHigh)
} else {
	xLow <- -Inf
	xHigh <- Inf
	yLow <- -Inf
	yHigh <- Inf
}

### COMPUTE RESULTS ###

points <- SmartR.data.cohort1$datapoints
concepts <- unique(points$concept)
if (! length(points)) {
	stop('Your selection does not match any patient in the defined cohort!')
}
xArr <- points[points$concept == concepts[1], ]
yArr <- points[points$concept == concepts[2], ]

xArr <- xArr[xArr$patientID %in% yArr$patientID, ]
yArr <- yArr[yArr$patientID %in% xArr$patientID, ]

xArr <- xArr[order(xArr$patientID), ]
yArr <- yArr[order(yArr$patientID), ]

patientIDs <- xArr$patientID

xArr <- xArr$value
yArr <- yArr$value

if (length(xArr) != length(yArr)) {
	stop(paste('Both variables must have the same number of patients!', length(xArr), length(yArr)))
}

selection <- (xArr >= xLow
			& xArr <= xHigh
			& yArr >= yLow
			& yArr <= yHigh)
xArr <- xArr[selection]
yArr <- yArr[selection]
patientIDs <- patientIDs[selection]

annotations <- SmartR.data.cohort1$annotations
tags <- list()
if (length(annotations) > 0) {
	annotations <- annotations[annotations$patientID %in% patientIDs, ]
	tags <- annotations$value
	if (length(tags) == 0) {
		stop("The chosen annotations don't map to any patients")
	}
	sorting <- match(annotations$patientID, patientIDs)
	tags <- tags[order(sorting)]
}

corTest <- cor.test(xArr, yArr, method=method)
regLineSlope <- corTest$estimate * (sd(yArr) / sd(xArr))
regLineYIntercept <- mean(yArr) - regLineSlope * mean(xArr)

### WRITE OUTPUT ###

SmartR.output$correlation <- corTest$estimate
SmartR.output$pvalue <- corTest$p.value
SmartR.output$regLineSlope <- regLineSlope
SmartR.output$regLineYIntercept <- regLineYIntercept
SmartR.output$method <- settings$method
SmartR.output$xArrLabel <- concepts[1]
SmartR.output$yArrLabel <- concepts[2]
SmartR.output$xArr <- xArr
SmartR.output$yArr <- yArr
SmartR.output$patientIDs <- patientIDs
SmartR.output$tags <- tags
