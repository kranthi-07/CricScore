package com.example.cricscore

import android.app.NotificationChannel
import android.app.NotificationManager
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.ActivityCompat
import android.content.pm.PackageManager
import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import android.content.Intent
import android.util.Base64
import java.io.File
import java.io.FileOutputStream
import androidx.core.content.FileProvider
class MainActivity : AppCompatActivity() {

    private val CHANNEL_ID = "live_match_channel"
    private val NOTIFICATION_ID = 101

    private lateinit var webView: WebView

    inner class WebAppInterface {

        @JavascriptInterface
        fun updateScore(title: String, content: String, isFinished: Boolean) {
            updateScoreNotification(title, content, isFinished)
        }


        @JavascriptInterface
        fun shareImage(base64Image: String, title: String) {

            try {

                val imageData = base64Image.substringAfter(",")
                val decodedBytes = Base64.decode(imageData, Base64.DEFAULT)

                val file = File(cacheDir, "shared_image.png")
                val fos = FileOutputStream(file)
                fos.write(decodedBytes)
                fos.flush()
                fos.close()

                val uri = FileProvider.getUriForFile(
                    this@MainActivity,
                    packageName + ".provider",
                    file
                )

                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                    type = "image/png"
                    putExtra(Intent.EXTRA_STREAM, uri)
                    putExtra(Intent.EXTRA_TEXT, title)
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }

                startActivity(Intent.createChooser(shareIntent, "Share via"))

            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        @JavascriptInterface
        fun vibrate(milliseconds: Int) {
            val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(
                    VibrationEffect.createOneShot(
                        milliseconds.toLong(),
                        VibrationEffect.DEFAULT_AMPLITUDE
                    )
                )
            } else {
                vibrator.vibrate(milliseconds.toLong())
            }
        }
    }




    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Live Match Updates",
                NotificationManager.IMPORTANCE_HIGH
            )

            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }


    private fun updateScoreNotification(
        title: String,
        content: String,
        isFinished: Boolean = false
    ) {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
            ) return
        }

        val intent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = android.app.PendingIntent.getActivity(
            this,
            0,
            intent,
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or
                    android.app.PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(content)
            .setStyle(NotificationCompat.BigTextStyle().bigText(content))
            .setContentIntent(pendingIntent)
            .setOnlyAlertOnce(true)
            .setPriority(
                if (isFinished)
                    NotificationCompat.PRIORITY_HIGH
                else
                    NotificationCompat.PRIORITY_DEFAULT
            )
            .setColor(Color.parseColor("#0F172A"))
            .setColorized(true)

        if (!isFinished) {
            builder.setOngoing(true)
            builder.setAutoCancel(false)
        } else {
            builder.setOngoing(false)
            builder.setAutoCancel(true)
        }

        NotificationManagerCompat.from(this)
            .notify(NOTIFICATION_ID, builder.build())
    }



    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.statusBarColor = Color.parseColor("#0F172A")
        window.navigationBarColor = Color.parseColor("#0F172A")

        createNotificationChannel()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    1
                )
            }
        }

        webView = WebView(this)

        setContentView(R.layout.activity_splash)
        webView.setOnTouchListener { _, event ->
            if (event.pointerCount > 1) {
                return@setOnTouchListener true
            }
            false
        }



        val splashHandler = android.os.Handler()

        splashHandler.postDelayed({

            webView = WebView(this)
            setContentView(webView)

            val settings = webView.settings
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = true
            settings.allowContentAccess = true

            settings.setSupportZoom(false)
            settings.builtInZoomControls = false
            settings.displayZoomControls = false

            webView.addJavascriptInterface(WebAppInterface(), "Android")

            webView.webViewClient = object : WebViewClient() {}

            webView.loadUrl("file:///android_asset/cricscore.html")

        }, 1800)
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true

// Disable zoom completely
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false
        settings.useWideViewPort = false
        settings.loadWithOverviewMode = false

        // ✅ ADD INTERFACE BEFORE LOADING URL
        webView.addJavascriptInterface(WebAppInterface(), "Android")

        webView.webViewClient = object : WebViewClient() {}

        window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_NOTHING)

        webView.loadUrl("file:///android_asset/cricscore.html")

        onBackPressedDispatcher.addCallback(this,
            object : androidx.activity.OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    if (webView.canGoBack()) {
                        webView.goBack()
                    } else {
                        finish()
                    }
                }
            })
    }

}
