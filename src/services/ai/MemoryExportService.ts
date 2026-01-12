/**
 * Memory Export Service
 * Exports memory data in various formats (Premium feature)
 */

import { trainingService } from "../training/TrainingService";
import { conversationManager } from "./ConversationManager";
import { memoryAnalyticsService } from "./MemoryAnalyticsService";

interface ExportOptions {
    includeConversations: boolean;
    includeMemory: boolean;
    includeRules: boolean;
    includeExperiences: boolean;
    includeAnalytics: boolean;
    format: "json" | "csv" | "markdown";
}

const DEFAULT_OPTIONS: ExportOptions = {
    includeConversations: true,
    includeMemory: true,
    includeRules: true,
    includeExperiences: true,
    includeAnalytics: true,
    format: "json"
};

class MemoryExportService {

    /**
     * Export all memory data
     */
    async export(options: Partial<ExportOptions> = {}): Promise<{ filename: string; content: string; mimeType: string }> {
        const opts = { ...DEFAULT_OPTIONS, ...options };

        const data = this.gatherData(opts);

        switch (opts.format) {
            case "json":
                return this.exportJSON(data);
            case "csv":
                return this.exportCSV(data);
            case "markdown":
                return this.exportMarkdown(data);
            default:
                return this.exportJSON(data);
        }
    }

    /**
     * Gather all data for export
     */
    private gatherData(options: ExportOptions): any {
        const data: any = {
            exportedAt: new Date().toISOString(),
            version: "1.0.0"
        };

        if (options.includeMemory || options.includeRules || options.includeExperiences) {
            const profile = trainingService.getProfile();

            if (options.includeMemory) {
                data.memory = {
                    identity: profile.identity,
                    rhythms: profile.rhythms,
                    knowledgeBase: profile.knowledgeBase || []
                };
            }

            if (options.includeRules) {
                data.rules = profile.rules || [];
            }

            if (options.includeExperiences) {
                data.experiences = profile.experiences || [];
            }
        }

        if (options.includeConversations) {
            data.conversations = {
                messages: conversationManager.getRecentMessages(100),
                summaries: conversationManager.getSummaries()
            };
        }

        if (options.includeAnalytics) {
            data.analytics = memoryAnalyticsService.getSummary();
        }

        return data;
    }

    /**
     * Export as JSON
     */
    private exportJSON(data: any): { filename: string; content: string; mimeType: string } {
        const date = new Date().toISOString().split("T")[0];
        return {
            filename: `zenner_memory_export_${date}.json`,
            content: JSON.stringify(data, null, 2),
            mimeType: "application/json"
        };
    }

    /**
     * Export as CSV (flattened for spreadsheet compatibility)
     */
    private exportCSV(data: any): { filename: string; content: string; mimeType: string } {
        const rows: string[] = [];

        // Header
        rows.push("Type,Category,Content,Timestamp,Metadata");

        // Knowledge items
        if (data.memory?.knowledgeBase) {
            data.memory.knowledgeBase.forEach((item: any) => {
                rows.push(this.csvRow([
                    "knowledge",
                    item.category || "fact",
                    item.content,
                    new Date(item.lastUpdated).toISOString(),
                    ""
                ]));
            });
        }

        // Rules
        if (data.rules) {
            data.rules.forEach((rule: any) => {
                rows.push(this.csvRow([
                    "rule",
                    rule.triggerContext,
                    rule.rule,
                    "",
                    rule.isActive ? "active" : "inactive"
                ]));
            });
        }

        // Experiences
        if (data.experiences) {
            data.experiences.forEach((exp: any) => {
                rows.push(this.csvRow([
                    "experience",
                    exp.sentiment,
                    exp.summary,
                    new Date(exp.timestamp).toISOString(),
                    (exp.keyLearnings || []).join("; ")
                ]));
            });
        }

        // Conversations
        if (data.conversations?.messages) {
            data.conversations.messages.forEach((msg: any) => {
                rows.push(this.csvRow([
                    "message",
                    msg.role,
                    msg.content.substring(0, 500), // Limit length
                    new Date(msg.timestamp).toISOString(),
                    ""
                ]));
            });
        }

        const date = new Date().toISOString().split("T")[0];
        return {
            filename: `zenner_memory_export_${date}.csv`,
            content: rows.join("\n"),
            mimeType: "text/csv"
        };
    }

    /**
     * Export as Markdown (human-readable)
     */
    private exportMarkdown(data: any): { filename: string; content: string; mimeType: string } {
        const lines: string[] = [];

        lines.push("# Zenner Memory Export");
        lines.push(`**Exported:** ${new Date().toLocaleString()}`);
        lines.push("");

        // Identity
        if (data.memory?.identity) {
            lines.push("## User Profile");
            lines.push(`- **Name:** ${data.memory.identity.name || "Not set"}`);
            lines.push(`- **Role:** ${data.memory.identity.role || "Not set"}`);
            lines.push(`- **Values:** ${(data.memory.identity.coreValues || []).join(", ") || "Not set"}`);
            lines.push(`- **Vision:** ${data.memory.identity.longTermVision || "Not set"}`);
            lines.push("");
        }

        // Knowledge Base
        if (data.memory?.knowledgeBase?.length > 0) {
            lines.push("## Knowledge Base");
            data.memory.knowledgeBase.forEach((item: any, i: number) => {
                lines.push(`${i + 1}. **[${item.category?.toUpperCase() || "FACT"}]** ${item.content}`);
            });
            lines.push("");
        }

        // Rules
        if (data.rules?.length > 0) {
            lines.push("## Behavioral Rules");
            data.rules.forEach((rule: any, i: number) => {
                const status = rule.isActive ? "✅" : "❌";
                lines.push(`${i + 1}. ${status} **[${rule.triggerContext}]** ${rule.rule}`);
            });
            lines.push("");
        }

        // Experiences
        if (data.experiences?.length > 0) {
            lines.push("## Recent Experiences");
            data.experiences.slice(0, 10).forEach((exp: any) => {
                const date = new Date(exp.timestamp).toLocaleDateString();
                const emoji = exp.sentiment === "positive" ? "😊" : exp.sentiment === "negative" ? "😔" : "😐";
                lines.push(`- **${date}** ${emoji} ${exp.summary}`);
            });
            lines.push("");
        }

        // Conversation Summaries
        if (data.conversations?.summaries?.length > 0) {
            lines.push("## Conversation History Summaries");
            data.conversations.summaries.forEach((summary: string, i: number) => {
                lines.push(`### Session ${i + 1}`);
                lines.push(summary);
                lines.push("");
            });
        }

        // Analytics
        if (data.analytics) {
            lines.push("## Analytics Summary");
            lines.push(`- **Messages this month:** ${data.analytics.thisMonth?.messages || 0}`);
            lines.push(`- **Tokens used:** ${data.analytics.thisMonth?.tokens?.toLocaleString() || 0}`);
            lines.push(`- **Estimated cost:** $${data.analytics.costEstimate?.estimatedCost || 0}`);
            lines.push(`- **Memory items added:** ${data.analytics.thisMonth?.memoryGrowth || 0}`);
            lines.push("");
        }

        const date = new Date().toISOString().split("T")[0];
        return {
            filename: `zenner_memory_export_${date}.md`,
            content: lines.join("\n"),
            mimeType: "text/markdown"
        };
    }

    /**
     * Escape and format CSV row
     */
    private csvRow(values: string[]): string {
        return values.map(v => {
            const escaped = (v || "").replace(/"/g, '""');
            return `"${escaped}"`;
        }).join(",");
    }

    /**
     * Download export file (for browser)
     */
    async downloadExport(options: Partial<ExportOptions> = {}): Promise<void> {
        const { filename, content, mimeType } = await this.export(options);

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

export const memoryExportService = new MemoryExportService();
