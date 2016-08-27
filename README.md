Link in native dependencies: `rnpm link react-native-udp`

Drop "node_modules/react-native-vector-icons/Fonts" into project in XCode

    Browse to node_modules/react-native-vector-icons and drag the folder Fonts (or just the ones you want) to your project in Xcode. Make sure your app is checked under "Add to targets" and that "Create groups" is checked if you add the whole folder.

    Edit Info.plist and add a property called Fonts provided by application (or UIAppFonts if Xcode won't autocomplete/not using Xcode) and type in the files you just added. It will look something like this:

   <key>UIAppFonts</key>
    <array>
        <string>Entypo.ttf</string>
        <string>EvilIcons.ttf</string>
        <string>FontAwesome.ttf</string>
        <string>Foundation.ttf</string>
        <string>Ionicons.ttf</string>
        <string>MaterialIcons.ttf</string>
        <string>Octicons.ttf</string>
        <string>Zocial.ttf</string>
    </array>

    If you want to use the TabBar/NavigatorIOS integration or use getImageSource, then you need to add RNVectorIcons.xcodeproj to Libraries and add libRNVectorIcons.a to Link Binary With Libraries under Build Phases. More info and screenshots about how to do this is available in the React Native documentation.
