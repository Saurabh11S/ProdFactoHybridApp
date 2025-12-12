package com.facto.userapp;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Ensure status bar is properly initialized
        // The Capacitor StatusBar plugin will handle runtime configuration
        // This ensures the status bar is ready for JavaScript configuration
    }
}
