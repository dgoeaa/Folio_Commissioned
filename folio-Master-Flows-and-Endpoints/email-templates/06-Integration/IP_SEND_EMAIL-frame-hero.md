# IP_SEND_EMAIL: per-template hero and fragment bodies

This change applies to the IP_SEND_EMAIL frame flow (df59a69f), in the `Send_Email` and `Send_Email_With_Attachments` actions. It resolves finding F1 (double frame) and gives every fragment-carried template its own hero colours. Action names, existing variables and the `payload.email.html` field stay as they are.

## 1. Add two Compose actions

Paste `IP_SEND_EMAIL-hero-actions.json` into the flow's code view, ahead of the two send actions:

- **`Compose_Hero_Schemes`** holds the 58 schemes from `02-Design-System/hero-schemes.json`, keyed by template ID.
- **`Compose_Hero`** picks the scheme named by `payload.email.hero.purpose`. If the purpose is missing or unknown, it falls back to the `Frame-IP-Send-Email` scheme (white ground, Deep Green rule).

The expressions read the payload as `triggerBody()?['email']`. That is the same object the frame already reads `html` from. If the frame's existing expression for the body uses a different root, such as `triggerBody()?['payload']?['email']`, use that same root in `Compose_Hero` and in the expressions below.

## 2. Replace the frame's hero row

In the frame HTML, replace the row that prints "Official correspondence" with the row below. Every value is an expression; nothing is hard-coded.

```html
<tr><td class="px" bgcolor="@{outputs('Compose_Hero')?['ground']}" style="padding:30px 32px 28px;background:@{outputs('Compose_Hero')?['ground']};border-bottom:4px solid @{outputs('Compose_Hero')?['rule']}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding:0 0 12px"><span style="display:inline-block;padding:5px 12px;border-radius:999px;background:@{outputs('Compose_Hero')?['chipGround']};border:1px solid @{outputs('Compose_Hero')?['chipBorder']};color:@{outputs('Compose_Hero')?['chipText']};font-family:Verdana,Geneva,sans-serif;font-size:11px;line-height:15px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;white-space:nowrap">@{coalesce(triggerBody()?['email']?['hero']?['chip'], 'Official correspondence')}</span></td></tr>
<tr><td><h1 class="h1" style="margin:0;font-family:Outfit,'Segoe UI',Arial,sans-serif;font-size:27px;line-height:34px;font-weight:700;letter-spacing:-.3px;color:@{outputs('Compose_Hero')?['headline']}">@{coalesce(triggerBody()?['email']?['hero']?['title'], triggerBody()?['email']?['subject'])}</h1></td></tr>
<tr><td style="padding:10px 0 0"><p style="margin:0;font-family:Verdana,Geneva,sans-serif;font-size:14px;line-height:22px;color:@{outputs('Compose_Hero')?['subline']}">@{coalesce(triggerBody()?['email']?['hero']?['lead'], '')}</p></td></tr>
</table></td></tr>
```

## 3. Footer note

In the footer, put `@{coalesce(triggerBody()?['email']?['footerNote'], '')}` above the address block.

## 4. Greeting rule

The frame adds "Dear Sir/Madam," when the first 600 characters of the body have no greeting. Every fragment in `01-Templates/fragments/` starts with its greeting, so no second greeting is added. The rule stays in place for callers that still send bare bodies.

## 5. Caller changes (Workspace)

`core/staff-notice-service.js`, `modules/reports.js`, `modules/statistics.js` and the Correspondence Desk set three fields on the IP_SEND_EMAIL payload:

| Field | Value |
|---|---|
| `email.html` | The fragment file, with its `{{placeholders}}` substituted as they are today |
| `email.hero` | The `payload.email.hero` object in the comment at the top of the fragment. `purpose` is the template ID; choose the variant ID (for example `SN-Escalation--hold`) when that variant applies. |
| `email.footerNote` | The `payload.email.footerNote` string in the same comment |

## 6. Test

1. Send `SN-Approval-Request` through the frame. The hero shows a #054871 ground with a #2A8AD1 rule and the chip "✉ Approval requested". "Dear Sir/Madam," does not appear.
2. Send any payload without `hero`. The hero shows the default white ground with a #05583B rule and the chip "Official correspondence".
3. Send `SN-Escalation--hold`. The commissioning-hold banner sits above the greeting, and the hero shows #FAD2D9 / #C8102E.
