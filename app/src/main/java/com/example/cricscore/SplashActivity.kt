package com.example.cricscore
import android.widget.ImageView
import android.view.View
import android.view.animation.DecelerateInterpolator
import android.view.animation.AccelerateInterpolator
import android.view.animation.OvershootInterpolator

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity

class SplashActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

//        val logo = findViewById<ImageView>(R.id.appLogo)
        val ball = findViewById<ImageView>(R.id.ball)




        // 🎇 Stadium Glow Pulse


        // 🏏 Cinematic Ball Bounce Animation
        // 🏏 IPL Style Single Bounce + Spin

        val shadow = findViewById<View>(R.id.ballShadow)
        val flash = findViewById<View>(R.id.impactFlash)

// Reset
        ball.translationY = 0f
        ball.rotation = 0f
        shadow.scaleX = 1f
        shadow.alpha = 0.4f

// 🚀 Jump Up
        ball.animate()
            .translationY(-350f)
            .rotationBy(360f)
            .setDuration(500)
            .setInterpolator(DecelerateInterpolator())
            .withStartAction {
                shadow.animate()
                    .scaleX(0.6f)
                    .alpha(0.2f)
                    .setDuration(500)
                    .start()
            }
            .withEndAction {

                // ⬇ Fall Down
                ball.animate()
                    .translationY(0f)
                    .rotationBy(360f)
                    .setDuration(420)
                    .setInterpolator(AccelerateInterpolator())
                    .withEndAction {

                        // 💥 Impact Flash
                        flash.animate()
                            .alpha(0.6f)
                            .setDuration(80)
                            .withEndAction {
                                flash.animate()
                                    .alpha(0f)
                                    .setDuration(200)
                                    .start()
                            }
                            .start()

                        // 🎯 Squash Effect
                        ball.animate()
                            .scaleX(1.15f)
                            .scaleY(0.85f)
                            .setDuration(100)
                            .withEndAction {
                                ball.animate()
                                    .scaleX(1f)
                                    .scaleY(1f)
                                    .setDuration(150)
                                    .setInterpolator(OvershootInterpolator())
                                    .start()
                            }
                            .start()

                        shadow.animate()
                            .scaleX(1f)
                            .alpha(0.4f)
                            .setDuration(200)
                            .start()
                    }
                    .start()
            }
            .start()





        // 🚀 Fast Splash Exit
        Handler(Looper.getMainLooper()).postDelayed({
            startActivity(Intent(this, MainActivity::class.java))
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            finish()
        }, 1800)
    }
}

