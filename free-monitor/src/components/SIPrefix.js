var prefixes={
    yotta:{
        factor:1e24,
        symbol:"Y",
    },
    zetta:{
        factor:1e21,
        symbol:"Z",
    },
    exa:{
        factor:1e18,
        symbol:"E",
    },
    peta:{
        factor:1e15,
        symbol:"P",
    },
    tera:{
        factor:1e12,
        symbol:"T",
    },
    giga:{
        factor:1e9,
        symbol:"G",
    },
    mega:{
        factor:1e6,
        symbol:"M",
    },
    kilo:{
        factor:1e3,
        symbol:"k",
    },
    hecto:{
        factor:1e2,
        symbol:"h"
    },
    deka:{
        factor:1e1,
        symbol:"da",
    },
    unitary:{
        factor:1,
        symbol:"",
    },
    deci:{
        factor:1e-1,
        symbol:"d",
    },
    centi:{
        factor:1e-2,
        symbol:"c",
    },
    milli:{
        factor:1e-3,
        symbol:"m",
    },
    micro:{
        factor:1e-6,
        symbol:"µ",
    },
    nano:{
        factor:1e-9,
        symbol:"n",
    },
    pico:{
        factor:1e-12,
        symbol:"p",
    },
    femto:{
        factor:1e-15,
        symbol:"f",
    },
    atto:{
        factor:1e-18,
        symbol:"a"
    },
    zepto:{
        factor:1e-21,
        symbol:"z",
    },
    yocto:{
        factor:1e-24,
        symbol:"y",
    },

};
var toRawValue = (value,prefix)=>{
    if(prefix in prefixes){
        return value * prefixes[prefix].factor;
    }else{
        return -1;
    }
};
const prefixGroups = {
    DEFAULT:["tera", "giga", "mega", "kilo", "unitary", "milli", "micro", "nano", "pico"],
    ALL:["yotta", "zetta", "exa", "peta", "tera", "giga", "mega", "kilo", "hecto", 
        "deka", "unitary","deci", "centi", "milli", "micro", "nano", "pico", "femto", 
        "atto", "zepto", "yocto"]
};
var funcAutoToAddressedValue = (activePrefixList,rawPrefix = "unitary")=>{
    var maxPrefix = "";
    var minPrefix = ""; 
    var activePrefixes = {}; 

    var rawFactor = 1;
    if(rawPrefix in prefixes) rawFactor = prefixes[rawPrefix].factor;
    
    if(typeof(activePrefixList) == "string"){
        if(activePrefixList in prefixGroups){
            activePrefixList = prefixGroups[activePrefixList];
        }else{
            console.warn("Prefix Group " + activePrefixList + " is not found.")
            activePrefixList = prefixGroups["ALL"];
        }
    }
    for(var i=0;i<activePrefixList.length;i++){
        if(activePrefixList[i] in prefixes){
            activePrefixes[activePrefixList[i]] = prefixes[activePrefixList[i]];
            activePrefixes[activePrefixList[i]].factor /= rawFactor;
            if(maxPrefix == ""){
                maxPrefix = activePrefixList[i];
                minPrefix = activePrefixList[i]
            }
            if(prefixes[activePrefixList[i]].factor > prefixes[maxPrefix].factor ){
                maxPrefix = activePrefixList[i];
            }
            if(prefixes[activePrefixList[i]].factor < prefixes[minPrefix].factor ){
                minPrefix = activePrefixList[i];
            }
        }
    }
    return (value)=>{
        var isPositive = true;
        if(value < 0){
            isPositive = false;
            value = -value;
        } 
        var currentAddressedValue = 0;
        var re = {
            addressedValue:value/activePrefixes[minPrefix].factor,
            prefix:minPrefix
        };
        if(value >= activePrefixes[minPrefix].factor){
            for(var prefix in activePrefixes){
                currentAddressedValue = value/activePrefixes[prefix].factor;
                if(currentAddressedValue >= 1){
                    if(currentAddressedValue < re.addressedValue){
                        re.addressedValue = currentAddressedValue;
                        re.prefix = prefix;
                    }
                }
            } 
        }
        if(!isPositive){
            re.addressedValue = -re.addressedValue
        }
        return re;
    }
};
var funcToFixedAddressedValue = (prefix,rawPrefix = "unitary")=>{
    var factor = 1;
    if(prefix in prefixes)factor *= prefixes[prefix].factor;
    if(rawPrefix in prefixes)factor /= prefixes[rawPrefix].factor;
    return value => {
        return {
            addressedValue:value / factor,
            prefix:prefix
        }
    };
}

export default{
        prefixes,
        toRawValue,
        funcAutoToAddressedValue,
        funcToFixedAddressedValue,
        prefixGroups
}

