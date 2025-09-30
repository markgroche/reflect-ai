/**
 * ReflectLLMPackage.kt
 * Package to register the LLM native module with React Native
 */

package com.reflect.llm

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ReflectLLMPackage : ReactPackage {
    
    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> {
        return listOf(ReflectLLMBridge(reactContext))
    }
    
    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {
        return emptyList()
    }
}
