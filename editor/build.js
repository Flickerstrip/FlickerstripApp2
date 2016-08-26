({
    baseUrl: "./app",
    "shim": {
        "bootstrap" : { "deps" :['jquery'] },
        "jquery.spectrum"  : { "deps" :["jquery"] },
        "jquery.blockUI"  : { "deps" :["jquery"] },
    },
    paths: {
        "text":"./view/lib/text",
        "tmpl":"./view/tmpl",
        "ace":"./view/lib/ace",
        "base64-js":"./view/lib/base64-js",
        "bootstrap":"./view/lib/bootstrap.min",
        "cm":"./view/lib/cm",
        "hammer":"./view/lib/hammer",
        "jquery":"./view/lib/jquery",
        "jquery.spectrum":"./view/lib/jquery.spectrum",
        "jquery.touchwipe.min":"./view/lib/jquery.touchwipe.min",
        "tinycolor2":"./view/lib/tinycolor2",
        "tinycolor":"./view/lib/tinycolor2",
        "underscore":"./view/lib/underscore",
    },
    include: ['./view/lib/require.js'],
    name: "main",
    out: "./build/compiled.js",
})
/*

({
    baseUrl: "view/lib",
    "shim": {
        "bootstrap" : { "deps" :['jquery'] },
        "jquery.spectrum"  : { "deps" :["jquery"] },
        "jquery.blockUI"  : { "deps" :["jquery"] },
    },
    paths: {
        "view":"..",
        "tmpl":"../tmpl",
        "shared":"../../shared"
    },
    include: ['./view/lib/require.js'],
    name: "../../main",
    out: "build/main-built.js"
})
*/

/*
        "jquery":"./view/lib/jquery",
        "underscore":"./view/lib/underscore",
        "tinycolor":"./view/lib/tinycolor2",
        "tinycolor2":"./view/lib/tinycolor2",
        "ace":"./view/lib/ace",
        "base64-js":"./view/lib/base64js",
        "text":"./view/lib/text",
        "jquery.spectrum":"./view/lib/jquery.spectrum",
        "jquery.blockUI":"./view/lib/jquery.blockUI",
        "bootstrap":"./view/lib/bootstrap.min",
        */
