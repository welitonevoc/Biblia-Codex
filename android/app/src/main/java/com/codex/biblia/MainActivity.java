package com.codex.biblia;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.codex.biblia.plugin.BibleDictionaryPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(BibleDictionaryPlugin.class);
    }
}
