df <- data.frame(gp = factor(rep(letters[1:3], each = 10)),
                 y = rnorm(30))
library(plyr)
require(ggplot2)
ds <- ddply(df, .(gp), summarise, mean = mean(y), sd = sd(y))
SmartR.plot <- ggplot(df, aes(x = gp, y = y)) +
   geom_point() +
   geom_point(data = ds, aes(y = mean),
              colour = 'red', size = 3)
