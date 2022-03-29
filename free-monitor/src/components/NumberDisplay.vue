<script setup>
import { watch } from 'vue';
//import NumberDisplayCard from "./NumberDisplayCard.vue"
import SI from './SIPrefix';
import { useCookies } from "vue3-cookies"
</script>

<script>
export default {
    props:{
        inputSettings:{},
        inputDataId:{
            type:String,
            default:""
            
        },
        inputAddressedValue:{
            type:Number,
            default:0
        }
    },
    inject:{
        isDebug:{//whether use debug mode
            default: true
        },
        allowCookies:{
            default: false
        }
    },
    data() {
        return {
            settings:{
                unit: "Hz",//Unit of display card. Only effect display string.
                /** Notation:
                *   fixed prefix: fixed prefix | no scientific notation
                *   scientific: fixed prefix | scientific notation
                *   normal: variable prefix
                */ 
                notation: "",
                inputPrefix:"unitary",//Prefix of input value.
                displayPrefix:"unitary",//Prefix of display value. Only can be set in "fixed prefix" "scientific" notation. Display in all notation.
                displayPrefixes:[],//Active prefixes list of display value. Only take effect in "normal" notation.
                displayPrefixGroupName:"DEFAULT",//Name of preset group of prefixes. Refer to SIPrefix.js.
                displayDecimalPlaces:2,//Decimal places of display.
                fontSize: 50,//Display font size.
                isVisible: true,//Visibility of whole panel (except for title and button to switch this value). 
                isSetupVisible: true,//Visibility of setup menu.
            },
            debugSettings:{
                isDebugSetupVisible:true,//Visibility of debug menu.
            }, 
            //inputAddressedValue: 0,//Input value with certain prefix (refer to "settings.inputPrefix").
            displayValue:0,//Number of display.
            isPrefixesSetByGroupName:false,//A flag to indicate whether "settings.displayPrefixes" is set by "settings.displayPrefixGroupName".
            isAbleToSetCookies:false,
            toVModel:{//if properties below are not wrapped in an object, v-model will not work after build 
                inputAddressedValueDebug:0
            }
            
        }
    },
    methods:{
        /** Interface methods
         *  Input: [Number] a value (with "settings.inputPrefix")
         *  Output: [Object]
         *      "{
         *          addressedValue: value with 'settings.displayPrefix',
         *          prefix: 'settings.displayPrefix',
         *      }"
         *  > Update when relevent settings are changed.
         */
        toDisplayValueWithPrefix(){ 
            return -1
        },
        saveSettingsToCookieIfAllowed(){
            if(this.allowCookies && this.isAbleToSetCookies){
                if(this.isDebug){
                    console.log(this.inputDataId+"NumberDisplay cookie is saved:");
                    console.log(this.settings);
                }

                
                this.cookies.set(this.inputDataId+"NumberDisplay",this.settings)
            }
        },
        loadSettingsFromCookieIfExists(){
            if(this.cookies.isKey(this.inputDataId+"NumberDisplay")){
                
                var cookieSetting = this.cookies.get(this.inputDataId+"NumberDisplay")
                if(this.isDebug){
                    console.log(this.inputDataId+"NumberDisplay cookie is loaded")
                    console.log(cookieSetting);
                }

                this.applySettings(cookieSetting)
            }
        },
        clearSettingFromCookies(){
            this.cookies.remove(this.inputDataId+"NumberDisplay")
        },
        applySettings(newSettings){
            for(var setting in newSettings){
                if(setting in this.settings){
                    this.settings[setting] = newSettings[setting];
                }
            }
        },
        
    },
    beforeCreate(){
        const {cookies} = useCookies();
        this.cookies = cookies; 
    },
    created:function (){//some initializations.
        this.settings.notation = "fixed prefix";
        this.isPrefixesSetByGroupName = true;
        this.settings.displayPrefixes = SI.prefixGroups[this.settings.displayPrefixGroupName]
        this.isAbleToSetCookies = true;
    },
    watch:{
        isToUpdateConvertingFunction(newSettings,oldSettings){
            if(newSettings.notation == "scientific"){//if set to "scientific" notation
                this.toDisplayValueWithPrefix = SI.funcToFixedAddressedValue(newSettings.displayPrefix,newSettings.inputPrefix)
            }else if(newSettings.notation == "normal"){//if set to "normal" notation
                if(newSettings.displayPrefixes.length){//without this error will occur before "created".
                    this.toDisplayValueWithPrefix = SI.funcAutoToAddressedValue(newSettings.displayPrefixes,newSettings.inputPrefix)
                }
            }else if(newSettings.notation == "fixed prefix"){//if set to "fixed prefix" notation
                this.toDisplayValueWithPrefix = SI.funcToFixedAddressedValue(newSettings.displayPrefix,newSettings.inputPrefix)
            }
            this.displayValueWithPrefix = this.toDisplayValueWithPrefix(this.inputAddressedValue);//update display value right after updating converting methods
        },
        inputAddressedValue(newValue,oldValue){//update display value and prefix when input value is changed.
            this.displayValueWithPrefix = this.toDisplayValueWithPrefix(newValue);
        },
        "settings.displayPrefixGroupName"(newName,oldName){//update "settings.displayPrefixes" when "settings.displayPrefixGroupName" is changed.
            if(newName!="customized"){
                this.isPrefixesSetByGroupName = true;
                this.settings.displayPrefixes = SI.prefixGroups[newName]
            }
        },
        "settings.displayPrefixes"(newPrefixes,oldPrefixes){//change "settings.displayPrefixGroupName" to "'customized'" when "settings.displayPrefixes" is changed.
            if(this.isPrefixesSetByGroupName){
                this.isPrefixesSetByGroupName = false;
            }else{
                this.settings.displayPrefixGroupName = "customized";
            }
        },
        inputSettings(newSettings,oldSettings){
            this.applySettings(newSettings);
        }, 
        inputDataId(newID,oldID){
            this.loadSettingsFromCookieIfExists();
        },
        "toVModel.inputAddressedValueDebug"(newValue,oldValue){
            this.displayValueWithPrefix = this.toDisplayValueWithPrefix(newValue)
        }
    },
    computed:{
        isToUpdateConvertingFunction(){//provide a object that can be watched. Converting method will be then updated.
            var re = {};
            re.notation = this.settings.notation;
            re.inputPrefix = this.settings.inputPrefix;
            re.displayPrefix = this.settings.displayPrefix;
            re.displayPrefixes = this.settings.displayPrefixes;
            return re;
        },
        displayValueWithPrefix:{
            get(){
                return {
                    addressedValue:this.displayValue,
                    prefix:this.settings.displayPrefix
                }
            },
            set(valueWithPrefix){
                this.displayValue = valueWithPrefix.addressedValue;
                this.settings.displayPrefix = valueWithPrefix.prefix;
            }
        },
        displayValueInString(){//Interface that provide a display value in string.
            if(this.settings.notation == "normal"){
                return this.displayValue.toFixed(this.settings.displayDecimalPlaces);
            }else if(this.settings.notation == "scientific"){
                return this.displayValue.toExponential(this.settings.displayDecimalPlaces);
            }else if(this.settings.notation == "fixed prefix"){
                return this.displayValue.toFixed(this.settings.displayDecimalPlaces);
            }else{
                return ()=>-1;
            }
        }
    }
}
</script>

<template>
    <div class = "number-display">
        <div>Number Display Panel</div>
        save settings<input type="button" @click="saveSettingsToCookieIfAllowed()">
        load settings<input type="button" @click="loadSettingsFromCookieIfExists()">
        remove settings<input type="button" @click="clearSettingFromCookies()">
        <div style="display:inline">
            Visible: 
            <input type="checkbox" v-model="settings.isVisible">
        </div>
        <div style="display:inline" v-show="settings.isVisible">
            Setup Visible: 
            <input type="checkbox" v-model="settings.isSetupVisible">
        </div>
        <div style="display:inline" v-show="settings.isVisible && settings.isSetupVisible" v-if="isDebug">
            Debug:
            <input type="checkbox" v-model="debugSettings.isDebugSetupVisible">
        </div>
        <div v-show="settings.isVisible">
            <div v-show="settings.isSetupVisible">
                Setup:
                <div>
                    Unit: 
                    <select v-model="settings.inputPrefix">
                        <option v-for="(prefix,prefix_name) in SI.prefixes" :key="prefix_name" :value="prefix_name">{{prefix.symbol}}</option>
                    </select>
                    <input type="text" v-model="settings.unit">
                </div>
                <div>
                    Font Size:
                    <input type="range" min="1" max="500" v-model="settings.fontSize">
                    <input style="width: 30px" type="text" v-model="settings.fontSize">
                </div>
                <div>
                    Notation: 
                    <select v-model="settings.notation">
                        <option disabled value="">choose notation...</option>
                        <option selected="selected">normal</option>
                        <option>scientific</option>
                        <option>fixed prefix</option>
                    </select>
                </div>
                <div>
                    <template v-if="settings.notation == 'scientific' || settings.notation == 'fixed prefix'">
                        Display Prefix: 
                        <select v-model="settings.displayPrefix">
                            <option v-for="(prefix,prefix_name) in SI.prefixes" :key="prefix_name" :value="prefix_name">{{prefix.symbol}}</option>
                        </select>
                    </template>
                    <template v-else-if="settings.notation == 'normal'">
                        Display Prefixes: 
                        <select v-model="settings.displayPrefixGroupName">
                            <option v-for="(prefixGroup,prefixGroup_name) in SI.prefixGroups" :key="prefixGroup_name">{{prefixGroup_name}}</option>
                            <option>customized</option>
                        </select>
                        <select v-model="settings.displayPrefixes" multiple>
                            <option v-for="(prefix,prefix_name) in SI.prefixes" :key="prefix_name" :value="prefix_name">{{prefix.symbol}}</option>
                        </select>        
                    </template>
                </div>
                <div>
                    Decimal Places:
                    <input type="range" min="0" max="8" v-model="settings.displayDecimalPlaces">
                    <input style="width: 30px" type="text" v-model="settings.displayDecimalPlaces">
                </div>
                <div v-if="isDebug" v-show="debugSettings.isDebugSetupVisible" style="color: gray">
                    For DEBUG only:
                    <div>
                        Addressed Value: 
                        <input type="range" min="0.00001" max="1000" v-model="toVModel.inputAddressedValueDebug">
                        <input style="width: 100px" type="text" v-model="toVModel.inputAddressedValueDebug">
                    </div>
                    <div>Notation: <span>{{settings.notation}}</span></div>
                    <div>Input Prefix: <span>{{settings.inputPrefix}}</span></div>
                    <div v-if="settings.notation == 'normal'">Display Prefixes: {{settings.displayPrefixes}}</div>
                </div>
            </div>
            <div class="number-display-card" :style="'font-size: ' + String(settings.fontSize) + 'px'">
                {{displayValueInString + " " + SI.prefixes[settings.displayPrefix].symbol + settings.unit}}
            </div>
        </div>
    </div>
</template>
<style>
.number-display {
    margin-left:1%;
    margin-right:1%;
    margin-top:5px;
    margin-bottom:5px;
    border-radius:10px;
    border:2px solid rgba(255, 0, 0, 0.555);
    padding-left:10px;
    padding-right:10px;
    padding-top:10px;
    padding-bottom:10px;
}
.number-display-card {
    text-align: center;
    margin-left:2%;
    margin-right:2%;
    margin-top:20px;
    margin-bottom:20px;
    border-radius:5px;
    border:1px solid blue;
    padding-left:10px;
    padding-right:10px;
    font-size: 70px;
    line-height: auto;
}
</style>
