package com.logigrine.espace;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.ImageFormat;
import android.graphics.Rect;
import android.graphics.YuvImage;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.core.ImageProxy;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.core.content.ContextCompat;
import androidx.core.app.ActivityCompat;

import com.google.common.util.concurrent.ListenableFuture;
import com.logigrine.espace.R;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;

public class CameraActivity extends AppCompatActivity {
    private static final String TAG = "CameraActivity";
    private ProcessCameraProvider cameraProvider;
    private ImageCapture imageCapture;
    private Executor cameraExecutor;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_camera);

        cameraExecutor = ContextCompat.getMainExecutor(this);

        ImageButton captureBtn = findViewById(R.id.captureBtn);
        ImageButton cancelBtn = findViewById(R.id.cancelBtn);

        captureBtn.setOnClickListener(v -> takePhoto());
        cancelBtn.setOnClickListener(v -> {
            setResult(RESULT_CANCELED);
            finish();
        });

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            Log.d(TAG, "Camera permission not granted - requesting runtime permission");
            try {
                Toast.makeText(this, "Demande d'autorisation d'accès à la caméra", Toast.LENGTH_SHORT).show();
            } catch (Exception ignored) {}
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA}, 101);
        } else {
            startCamera();
        }
    }

    private void startCamera() {
        ListenableFuture<ProcessCameraProvider> cameraProviderFuture = ProcessCameraProvider.getInstance(this);
        cameraProviderFuture.addListener(() -> {
            try {
                cameraProvider = cameraProviderFuture.get();
                Preview preview = new Preview.Builder().build();
                imageCapture = new ImageCapture.Builder().setTargetRotation(getWindowManager().getDefaultDisplay().getRotation()).build();
                CameraSelector cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA;

                androidx.camera.view.PreviewView previewView = findViewById(R.id.previewView);
                if (previewView != null) {
                    try {
                        // Some camera-view versions don't expose TEXTURE_VIEW; only set scaleType when available
                        previewView.setScaleType(androidx.camera.view.PreviewView.ScaleType.FILL_CENTER);
                    } catch (Exception e) {
                        Log.w(TAG, "PreviewView scaleType set failed", e);
                    }
                    Log.d(TAG, "PreviewView size: " + previewView.getWidth() + "x" + previewView.getHeight());
                    preview.setSurfaceProvider(previewView.getSurfaceProvider());
                } else {
                    Log.w(TAG, "previewView not found");
                }

                cameraProvider.unbindAll();
                cameraProvider.bindToLifecycle(this, cameraSelector, preview, imageCapture);
                Log.d(TAG, "Camera bound to lifecycle");
            } catch (ExecutionException | InterruptedException e) {
                Log.e(TAG, "Camera provider error", e);
                Toast.makeText(this, "Erreur démarrage caméra", Toast.LENGTH_SHORT).show();
            }
        }, cameraExecutor);
    }

    private void takePhoto() {
        if (imageCapture == null) return;

        imageCapture.takePicture(cameraExecutor, new ImageCapture.OnImageCapturedCallback() {
            @Override
            public void onCaptureSuccess(@NonNull ImageProxy image) {
                // Convert ImageProxy (YUV) to JPEG byte[] then to base64
                try {
                    byte[] jpeg = imageProxyToJpeg(image, 85);
                    if (jpeg != null) {
                        String base64 = Base64.encodeToString(jpeg, Base64.DEFAULT);
                        Intent res = new Intent();
                        res.putExtra("photo_base64", base64);
                        setResult(RESULT_OK, res);
                    } else {
                        Log.e(TAG, "Failed to convert image to JPEG");
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error processing image", e);
                } finally {
                    image.close();
                    finish();
                }
            }

            @Override
            public void onError(@NonNull ImageCaptureException exception) {
                Log.e(TAG, "Image capture failed", exception);
                Toast.makeText(CameraActivity.this, "Capture échouée", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == 101) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startCamera();
            } else {
                Toast.makeText(this, "Permission caméra refusée", Toast.LENGTH_SHORT).show();
                setResult(RESULT_CANCELED);
                finish();
            }
        }
    }

    // Helper: convert ImageProxy (YUV_420_888) to JPEG byte[]
    private static byte[] imageProxyToJpeg(ImageProxy image, int quality) {
        if (image == null) return null;
        ImageProxy.PlaneProxy[] planes = image.getPlanes();
        if (planes == null || planes.length == 0) return null;
        try {
            int width = image.getWidth();
            int height = image.getHeight();

            ByteBuffer yBuffer = planes[0].getBuffer();
            ByteBuffer uBuffer = planes[1].getBuffer();
            ByteBuffer vBuffer = planes[2].getBuffer();

            int ySize = yBuffer.remaining();
            int uSize = uBuffer.remaining();
            int vSize = vBuffer.remaining();

            byte[] nv21 = new byte[ySize + uSize + vSize];

            // U and V are swapped
            yBuffer.get(nv21, 0, ySize);

            byte[] uBytes = new byte[uSize];
            byte[] vBytes = new byte[vSize];
            uBuffer.get(uBytes);
            vBuffer.get(vBytes);

            // NV21 format needs VU ordering
            int index = ySize;
            for (int i = 0; i < vBytes.length; i++) {
                nv21[index++] = vBytes[i];
                if (i < uBytes.length) {
                    nv21[index++] = uBytes[i];
                }
            }

            YuvImage yuvImage = new YuvImage(nv21, ImageFormat.NV21, width, height, null);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            boolean ok = yuvImage.compressToJpeg(new Rect(0, 0, width, height), quality, baos);
            if (!ok) return null;
            return baos.toByteArray();
        } catch (Exception e) {
            Log.e(TAG, "imageProxyToJpeg error", e);
            return null;
        }
    }
}
