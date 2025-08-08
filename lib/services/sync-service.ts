import { supabase } from "../supabase";
import { ErrorHandler } from "../utils/error-handler";

export class SyncService {
  private static instance: SyncService;
  private syncQueue: Map<string, SyncJob> = new Map();
  private isProcessing = false;

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }

    return SyncService.instance;
  }

  async queueSync(job: SyncJob): Promise<string> {
    const jobId = `${job.walletId}_${Date.now()}`;

    job.id = jobId;
    job.status = "queued";
    job.queuedAt = new Date().toISOString();

    this.syncQueue.set(jobId, job);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return jobId;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.size === 0) return;

    this.isProcessing = true;

    try {
      while (this.syncQueue.size > 0) {
        const jobs = Array.from(this.syncQueue.values())
          .filter((job) => job.status === "queued")
          .sort((a, b) => (a.priority || 0) - (b.priority || 0));

        if (jobs.length === 0) break;

        const job = jobs[0];

        await this.processJob(job);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processJob(job: SyncJob): Promise<void> {
    try {
      job.status = "processing";
      job.startedAt = new Date().toISOString();

      // Update job status in database
      await this.updateJobStatus(job);

      // Process the actual sync
      const result = await this.executeSync(job);

      job.status = "completed";
      job.completedAt = new Date().toISOString();
      job.result = result;
    } catch (error: any) {
      job.status = "failed";
      job.error = error.message;
      job.completedAt = new Date().toISOString();

      ErrorHandler.handle(error, `SyncService.processJob.${job.walletId}`);
    } finally {
      await this.updateJobStatus(job);
      this.syncQueue.delete(job.id!);
    }
  }

  private async executeSync(job: SyncJob): Promise<any> {
    // This would integrate with your Zerion extension
    // For now, we'll return a placeholder
    return {
      success: true,
      syncedAt: new Date().toISOString(),
      data: {},
    };
  }

  private async updateJobStatus(job: SyncJob): Promise<void> {
    try {
      // Update the wallet_sync_jobs table
      const { error } = await supabase.from("wallet_sync_jobs").upsert({
        id: job.id,
        wallet_id: job.walletId,
        job_type: job.type,
        status: job.status,
        sync_options: job.options || {},
        started_at: job.startedAt,
        completed_at: job.completedAt,
        sync_result: job.result,
        error_message: job.error,
        priority: job.priority || 0,
      });

      if (error) {
        console.error("Failed to update job status:", error);
      }
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  }

  getQueueStatus(): {
    queued: number;
    processing: number;
    total: number;
  } {
    const jobs = Array.from(this.syncQueue.values());

    return {
      queued: jobs.filter((j) => j.status === "queued").length,
      processing: jobs.filter((j) => j.status === "processing").length,
      total: jobs.length,
    };
  }
}

interface SyncJob {
  id?: string;
  walletId: string;
  type: "full_sync" | "portfolio_only" | "transactions_only" | "nfts_only";
  status: "queued" | "processing" | "completed" | "failed";
  priority?: number;
  options?: Record<string, any>;
  queuedAt?: string;
  startedAt?: string;
  completedAt?: string;
  result?: any;
  error?: string;
}
