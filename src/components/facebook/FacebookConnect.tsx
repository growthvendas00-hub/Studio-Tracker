import { useState } from "react";
import { LogIn, AlertCircle, Check } from "lucide-react";
import { validateFacebookToken, fetchFacebookCampaigns } from "@/lib/api/facebook.functions";

interface FacebookConnectProps {
  onConnect?: (data: any) => void;
}

export function FacebookConnect({ onConnect }: FacebookConnectProps) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);

  const handleConnect = async () => {
    if (!token.trim()) {
      setError("Cole seu access token");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await validateFacebookToken({ accessToken: token });

      if (!result.success) {
        setError(result.error || "Erro ao validar token");
        return;
      }

      setConnected(true);
      setAccountInfo(result.account);
      localStorage.setItem("facebook_token", token);

      onConnect?.(result.account);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setToken("");
    setConnected(false);
    setAccountInfo(null);
    setError(null);
    localStorage.removeItem("facebook_token");
  };

  if (connected && accountInfo) {
    return (
      <div className="rounded-2xl border border-white/10 bg-card/80 p-4 shadow-soft backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
              <Check className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Conectado ao Facebook</p>
              <p className="text-xs text-muted-foreground">{accountInfo.name}</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-xs font-semibold text-destructive hover:text-destructive/80"
          >
            Desconectar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-card/80 p-4 shadow-soft backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-3">
        <LogIn className="h-4 w-4 text-primary" />
        <p className="text-sm font-bold text-foreground">Conectar ao Facebook</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Access Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Cole seu access token aqui"
            disabled={loading}
            className="mt-1 w-full rounded-lg bg-background px-3 py-2 text-xs text-foreground border border-border placeholder-muted-foreground/50 disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={loading || !token.trim()}
          className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Validando..." : "Conectar"}
        </button>

        <p className="text-[10px] text-muted-foreground leading-relaxed">
          💡 <strong>Como conseguir seu token:</strong> Vá em{" "}
          <a
            href="https://developers.facebook.com/docs/marketing-api/get-started"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-primary hover:text-primary/90"
          >
            developers.facebook.com
          </a>
          . Leia o README.SETUP.md do projeto para instruções completas.
        </p>
      </div>
    </div>
  );
}
