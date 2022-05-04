#!/usr/bin/env bash	

if [[ $(node -v) = *v12* ]]; then	
  karma start \	
      --browsers='bs_chrome_mac' \	
      --singleRun --reporters='dots,progress,BrowserStack'	
fi 	
