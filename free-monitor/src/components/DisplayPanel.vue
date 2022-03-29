<script setup>
import { VueElement } from 'vue';
import NumberDisplay from './NumberDisplay.vue';
import axios from 'axios'
import { useCookies } from "vue3-cookies"
</script>

<script>
export default {
    inject:{
        isDebug:{//whether use debug mode
            default: true
        },
        allowCookies:{
            default: false
        },
    },
    data() {
        return {
            data:{
                value: 0,
                id:""
            },
            timers:{
                t0:{
                    type:"timeout",
                    id:0
                }
            },
            debugSettings:{
                isDebugSetupVisible:true
            },
            childSettings:{
                numberDisplay:{}
            }
        }
    },
    methods:{
        updateValueFromUrl(url,type="number"){
            
            axios
                .get(url)
                .then((response) => {
                    if(type == "number"){
                        this.data.value = response.data;  
                    }  
                })
                .catch((error) => console.warn(error))
        },
        updatingValueFromUrl(url,timeout=1000,type="number"){
            this.updateValueFromUrl(url,type);
            this.timers.t0.id = setTimeout(()=>this.updatingValueFromUrl(url,timeout,type),timeout);
        },
        loadDefaultSettingsFromServer(url){
            var re
            axios
                .get(url)
                .then((response => {
                    re = response.data
                    this.data.id = re["id"]
                    if(!this.cookies.isKey(this.data.id+"NumberDisplay")){
                        this.childSettings.numberDisplay = re["settings"]["numberDisplay"]
                        if(this.isDebug){
                            console.log("server setting applied");
                        }
                    }
                }))
                .catch((error) => console.warn(error))
        }
    },
    beforeCreate(){
        const {cookies} = useCookies();
        this.cookies = cookies;
        
    },
    created(){//some initializations.
        this.updatingValueFromUrl("http://192.168.31.229:5000/data/",1000,"number");
        this.loadDefaultSettingsFromServer("http://192.168.31.229:5000/config/");
    },
    beforeUnmount(){
        clearTimeout(this.timers.t0.id);
    },
}

</script>
<template>
    <div v-if="isDebug" v-show="debugSettings.isDebugSetupVisible" style="color: gray">
        For DEBUG only:
        <div>Data: {{data.value}}</div>
        <div>typeof isDebug: {{isDebug}}</div>
    </div>
    <number-display :input-addressed-value="data.value" :input-data-id="data.id" :input-settings="childSettings.numberDisplay"></number-display>
</template>

