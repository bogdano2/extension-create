import parse from 'content-security-policy-parser'

export function patchV2CSP(policy: string) {
  if (!policy) {
    return (
      "script-src 'self' 'unsafe-eval' blob: filesystem:;" +
      "object-src 'self' blob: filesystem:;"
    )
  }

  const csp = parse(policy)
  policy = ''

  if (!csp['script-src']) {
    csp['script-src'] = ["'self' 'unsafe-eval' blob: filesystem:"]
  }

  if (!csp['script-src'].includes("'unsafe-eval'")) {
    csp['script-src'].push("'unsafe-eval'")
  }

  for (const k in csp) {
    policy += `${k} ${csp[k].join(' ')};`
  }

  return policy
}

export function patchV3CSP(policy: string) {
  if (!policy) {
    return "script-src 'self'; " + "object-src 'self';"
  }

  const csp = parse(policy)
  policy = ''

  if (!csp['script-src']) {
    csp['script-src'] = ["'self'"]
  }

  for (const k in csp) {
    policy += `${k} ${csp[k].join(' ')};`
  }

  return policy
}
