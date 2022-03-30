# Free Monitor
## Introduction
This is a python library to monitor any data on web. In current release only one data can be monitored with only a number displayed. More powerful functions are coming soon.
## Usage
### Initiate
```
cd ./free-monitor
npm install
npm run build
cd ../
```
### Run demo systemMonitor
```
python3 ./systemMonitor.py
```
### Use in your own project
To Use in your own python project, you can add codes below.
```python
# import free_monitor library
import free_monitor as fm 
# link data getter
fm.generateWebPage(yourDataGetter)
# link config file
fm.linkConfigFile(yourConfigFile)
# run server
fm.run()
```