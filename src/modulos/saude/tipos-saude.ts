export type StatusDependencia = 'ok' | 'degradado' | 'indisponivel';
export type StatusGeral = 'ok' | 'degradado' | 'indisponivel';

export interface ResultadoCheck {
  status: StatusDependencia;
  latencia_ms: number;
  ultima_verificacao: string;
  detalhe?: string;
}

export interface ResultadoSaude {
  status_geral: StatusGeral;
  servico: {
    nome: string;
    versao: string;
    ambiente: string;
    uptime_segundos: number;
  };
  dependencias: Record<string, ResultadoCheck>;
  cached: boolean;
  gerado_em: string;
}

export interface ResultadoLiveness {
  status: 'vivo';
  timestamp: string;
}
