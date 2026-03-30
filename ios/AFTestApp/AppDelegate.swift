import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import AppsFlyerLib
import AdSupport

@main
class AppDelegate: RCTAppDelegate {

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    self.moduleName = "AFTestApp"
    self.dependencyProvider = RCTAppDependencyProvider()
    print("IDFV: \(UIDevice.current.identifierForVendor?.uuidString ?? "nil")")
    print("IDFA: \(ASIdentifierManager.shared().advertisingIdentifier.uuidString)")
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }

  // URI Scheme deep linking (aftestapp://)
  override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    AppsFlyerLib.shared().handleOpen(url, options: options)
    return super.application(app, open: url, options: options)
  }

  // Universal Links deep linking (https://victortest2.onelink.me/...)
  override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    AppsFlyerLib.shared().continue(userActivity, restorationHandler: nil)
    return true
  }
}
