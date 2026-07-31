<?php
/**
 * Ag Salão - Envio de e-mail (Fase 2).
 *
 * Usa mail() do PHP (compatível com a Hostinger). Sempre não-bloqueante:
 * qualquer falha é registrada e retornada como false, sem interromper o fluxo.
 * Se 'mail_log' estiver configurado, grava o e-mail gerado em arquivo (auditoria/teste).
 */

function ag_send_mail(string $to, string $subject, string $htmlBody): bool
{
    $enabled = filter_var(ag_setting('mail_enabled', false), FILTER_VALIDATE_BOOLEAN);
    $from = ag_setting('mail_from', 'no-reply@localhost');
    $fromName = ag_setting('mail_from_name', 'Ag Salão');
    $logPath = ag_setting('mail_log', '');

    // Auditoria/teste: registra o conteúdo gerado
    if ($logPath) {
        $entry = "==== " . gmdate('c') . " ====\nTo: {$to}\nSubject: {$subject}\n\n{$htmlBody}\n\n";
        @file_put_contents($logPath, $entry, FILE_APPEND);
    }

    if (!$enabled || !$to) {
        return false;
    }

    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/html; charset=UTF-8';
    $headers[] = 'From: ' . sprintf('%s <%s>', $fromName, $from);

    try {
        return @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $htmlBody, implode("\r\n", $headers));
    } catch (Throwable $e) {
        return false;
    }
}

function ag_confirmation_email_html(array $app, array $settings): string
{
    $name = htmlspecialchars($settings['name'] ?? 'Salão');
    $client = htmlspecialchars($app['clientName'] ?? '');
    $code = htmlspecialchars($app['code'] ?? '');
    $service = htmlspecialchars($app['serviceName'] ?? '');
    $prof = htmlspecialchars($app['professionalName'] ?? '');
    $date = htmlspecialchars($app['date'] ?? '');
    $time = htmlspecialchars($app['time'] ?? '');
    $addr = htmlspecialchars(($settings['address'] ?? '') . ' - ' . ($settings['city'] ?? ''));
    return "<div style=\"font-family:Arial,sans-serif;max-width:520px;margin:auto\">"
        . "<h2 style=\"color:#1A1A1A\">{$name}</h2>"
        . "<p>Olá <strong>{$client}</strong>, seu agendamento foi confirmado!</p>"
        . "<table style=\"width:100%;border-collapse:collapse;font-size:14px\">"
        . "<tr><td>Código</td><td style=\"text-align:right\"><strong>{$code}</strong></td></tr>"
        . "<tr><td>Serviço</td><td style=\"text-align:right\">{$service}</td></tr>"
        . "<tr><td>Profissional</td><td style=\"text-align:right\">{$prof}</td></tr>"
        . "<tr><td>Data & Horário</td><td style=\"text-align:right\">{$date} às {$time}</td></tr>"
        . "</table>"
        . "<p style=\"color:#666;font-size:12px\">{$addr}</p>"
        . "</div>";
}

function ag_reminder_email_html(array $app, array $settings): string
{
    $name = htmlspecialchars($settings['name'] ?? 'Salão');
    $client = htmlspecialchars($app['clientName'] ?? '');
    $service = htmlspecialchars($app['serviceName'] ?? '');
    $date = htmlspecialchars($app['date'] ?? '');
    $time = htmlspecialchars($app['time'] ?? '');
    return "<div style=\"font-family:Arial,sans-serif;max-width:520px;margin:auto\">"
        . "<h2 style=\"color:#1A1A1A\">{$name}</h2>"
        . "<p>Olá <strong>{$client}</strong>, lembrete do seu horário amanhã:</p>"
        . "<p><strong>{$service}</strong> — {$date} às {$time}</p>"
        . "<p style=\"color:#666;font-size:12px\">Até breve!</p>"
        . "</div>";
}
