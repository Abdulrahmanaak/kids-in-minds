import { execFile } from "child_process";
import { promisify } from "util";
import { readFile, unlink, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const execFileAsync = promisify(execFile);

export type AudioResult = {
  buffer: Buffer;
  mimeType: string;
  durationSec: number | null;
  fileSizeBytes: number;
};

export async function extractAudio(youtubeVideoId: string): Promise<AudioResult> {
  const tempDir = await mkdtemp(join(tmpdir(), "yt-audio-"));
  const outputTemplate = join(tempDir, "audio.%(ext)s");
  const url = `https://www.youtube.com/watch?v=${youtubeVideoId}`;

  try {
    // Download best audio in webm format (no ffmpeg needed)
    await execFileAsync("yt-dlp", [
      "-f", "bestaudio[ext=webm]/bestaudio",
      "--no-playlist",
      "--no-warnings",
      "--quiet",
      "-o", outputTemplate,
      url,
    ], { timeout: 120_000 });

    // Find the downloaded file
    const { stdout } = await execFileAsync("yt-dlp", [
      "--print", "filename",
      "-f", "bestaudio[ext=webm]/bestaudio",
      "--no-playlist",
      "-o", outputTemplate,
      url,
    ], { timeout: 30_000 });

    const filePath = stdout.trim();
    const buffer = await readFile(filePath);

    // Get duration
    let durationSec: number | null = null;
    try {
      const { stdout: durationOut } = await execFileAsync("yt-dlp", [
        "--print", "duration",
        "--no-playlist",
        url,
      ], { timeout: 30_000 });
      durationSec = parseInt(durationOut.trim(), 10) || null;
    } catch {
      // Duration is optional
    }

    // Cleanup
    await unlink(filePath).catch(() => {});

    const ext = filePath.split(".").pop()?.toLowerCase();
    const mimeType = ext === "webm" ? "audio/webm" : ext === "m4a" ? "audio/mp4" : "audio/webm";

    return {
      buffer,
      mimeType,
      durationSec,
      fileSizeBytes: buffer.length,
    };
  } catch (error) {
    throw new Error(
      `Failed to extract audio for ${youtubeVideoId}: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
}
