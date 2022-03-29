
#%%

import psutil
import labPanel
# refer to https://stackoverflow.com/questions/276052/how-to-get-current-cpu-and-ram-usage-in-python

def getData():
    p = psutil.cpu_percent(interval=0.1)#/psutil.cpu_count()
    print(p)
    return str(p)
#%%
labPanel.generateWebPage(getData)
labPanel.linkConfigFile("./cpu_percent.json")
labPanel.run()
