export interface Voice {
  voice_id: string
  name: string
  samples: Array<{
    sample_id: string
    file_name: string
    mime_type: string
    size_bytes: number
    hash: string
  }>
  category: string
  fine_tuning: {
    model_id: string
    is_allowed_to_fine_tune: boolean
    fine_tuning_requested: boolean
    finetuning_state: string
    verification_attempts: number
    verification_failures: number
    verification_attempts_count: number
    slice_ids: string[]
  }
  labels: Record<string, string>
  description: string
  preview_url: string
  available_for_tiers: string[]
  settings: null | {
    stability: number
    similarity_boost: number
    style: number
    use_speaker_boost: boolean
  }
}

export interface AlertAudio {
  language: string
  audioUrl: string
}
