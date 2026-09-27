const WIREGUARD_PROTOCOL = 'wireguard://'
const TEXT_FILE_MIME_TYPE = 'application/octet-stream'

const safeDecodeURIComponent = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const formatCommaSeparatedValue = (value: string) =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .join(', ')

const getSearchParam = (params: URLSearchParams, name: string) => {
  const directValue = params.get(name)
  if (directValue !== null) return directValue

  const normalizedName = name.toLowerCase()
  for (const [key, value] of params.entries()) {
    if (key.toLowerCase() === normalizedName) {
      return value
    }
  }

  return ''
}

const sanitizeFileNameSegment = (value: string | null | undefined) => {
  if (!value) return ''

  return safeDecodeURIComponent(value)
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^\.+|\.+$/g, '')
    .trim()
}

const getWireGuardEndpointHost = (hostname: string) => {
  if (hostname.includes(':') && !hostname.startsWith('[')) {
    return `[${hostname}]`
  }

  return hostname
}

type ParsedWireGuardUri = {
  address: string
  allowedIps: string
  dns: string
  endpoint: string
  mtu: string
  port: string
  preSharedKey: string
  privateKey: string
  publicKey: string
  remark: string
  reserved: string
  source: string
  keepalive: string
  jc: string
  jmin: string
  jmax: string
  s1: string
  s2: string
  s3: string
  s4: string
  h1: string
  h2: string
  h3: string
  h4: string
  i1: string
  i2: string
  i3: string
  i4: string
  i5: string
}

const parseWireGuardUri = (value: string): ParsedWireGuardUri | null => {
  if (!isWireGuardConfigUrl(value)) {
    return null
  }

  try {
    const source = value.trim()
    const parsed = new URL(source)
    const hostname = parsed.hostname
    const port = parsed.port
    const endpointHost = getWireGuardEndpointHost(hostname)

    return {
      address: getSearchParam(parsed.searchParams, 'address'),
      allowedIps: getSearchParam(parsed.searchParams, 'allowedips'),
      dns: getSearchParam(parsed.searchParams, 'dns'),
      endpoint: port ? `${endpointHost}:${port}` : endpointHost,
      mtu: getSearchParam(parsed.searchParams, 'mtu'),
      port,
      preSharedKey: getSearchParam(parsed.searchParams, 'presharedkey'),
      privateKey: safeDecodeURIComponent(parsed.username),
      publicKey: getSearchParam(parsed.searchParams, 'publickey'),
      remark: safeDecodeURIComponent(parsed.hash.replace(/^#/, '')),
      reserved: getSearchParam(parsed.searchParams, 'reserved'),
      source,
      keepalive: getSearchParam(parsed.searchParams, 'keepalive'),
      jc: getSearchParam(parsed.searchParams, 'jc'),
      jmin: getSearchParam(parsed.searchParams, 'jmin'),
      jmax: getSearchParam(parsed.searchParams, 'jmax'),
      s1: getSearchParam(parsed.searchParams, 's1'),
      s2: getSearchParam(parsed.searchParams, 's2'),
      s3: getSearchParam(parsed.searchParams, 's3'),
      s4: getSearchParam(parsed.searchParams, 's4'),
      h1: getSearchParam(parsed.searchParams, 'h1'),
      h2: getSearchParam(parsed.searchParams, 'h2'),
      h3: getSearchParam(parsed.searchParams, 'h3'),
      h4: getSearchParam(parsed.searchParams, 'h4'),
      i1: getSearchParam(parsed.searchParams, 'i1'),
      i2: getSearchParam(parsed.searchParams, 'i2'),
      i3: getSearchParam(parsed.searchParams, 'i3'),
      i4: getSearchParam(parsed.searchParams, 'i4'),
      i5: getSearchParam(parsed.searchParams, 'i5'),
    }
  } catch {
    return null
  }
}

export const isWireGuardConfigUrl = (value: string) => value.trim().toLowerCase().startsWith(WIREGUARD_PROTOCOL)

export const convertWireGuardUrlToConfig = (value: string) => {
  const parsed = parseWireGuardUri(value)

  if (!parsed || !parsed.privateKey || !parsed.publicKey || !parsed.address || !parsed.endpoint) {
    return null
  }

  const lines: string[] = []

  if (parsed.remark) {
    lines.push(`# Name = ${parsed.remark}`)
  }

  lines.push('[Interface]')
  lines.push(`PrivateKey = ${parsed.privateKey}`)
  lines.push(`Address = ${formatCommaSeparatedValue(parsed.address)}`)

  if (parsed.dns) {
    lines.push(`DNS = ${formatCommaSeparatedValue(parsed.dns)}`)
  }

  if (parsed.mtu) {
    lines.push(`MTU = ${parsed.mtu}`)
  }

  if (parsed.reserved) {
    lines.push(`Reserved = ${parsed.reserved}`)
  }

  const awgFields: Array<[string, string]> = [
    ['Jc', parsed.jc],
    ['Jmin', parsed.jmin],
    ['Jmax', parsed.jmax],
    ['S1', parsed.s1],
    ['S2', parsed.s2],
    ['S3', parsed.s3],
    ['S4', parsed.s4],
    ['H1', parsed.h1],
    ['H2', parsed.h2],
    ['H3', parsed.h3],
    ['H4', parsed.h4],
    ['I1', parsed.i1],
    ['I2', parsed.i2],
    ['I3', parsed.i3],
    ['I4', parsed.i4],
    ['I5', parsed.i5],
  ]

  for (const [key, value] of awgFields) {
    if (value) lines.push(`${key} = ${value}`)
  }

  lines.push('')
  lines.push('[Peer]')
  lines.push(`PublicKey = ${parsed.publicKey}`)

  if (parsed.preSharedKey) {
    lines.push(`PresharedKey = ${parsed.preSharedKey}`)
  }

  if (parsed.allowedIps) {
    lines.push(`AllowedIPs = ${formatCommaSeparatedValue(parsed.allowedIps)}`)
  }

  lines.push(`Endpoint = ${parsed.endpoint}`)

  if (parsed.keepalive) {
    lines.push(`PersistentKeepalive = ${parsed.keepalive}`)
  }

  return lines.join('\n')
}

export const buildWireGuardDownloadFileName = (value: string) => {
  const parsed = parseWireGuardUri(value)

  if (!parsed) {
    return 'wireguard.conf'
  }

  const fileNameParts = [sanitizeFileNameSegment(parsed.remark)].filter(Boolean)
  const fallbackPart =
    sanitizeFileNameSegment(formatCommaSeparatedValue(parsed.address).replace(/[,:/[\]]+/g, '-')) || 'wireguard'

  return `${fileNameParts.join('_') || fallbackPart}.conf`
}

export const getWireGuardDownloadPayload = (value: string) => {
  if (!isWireGuardConfigUrl(value)) {
    return null
  }

  const content = convertWireGuardUrlToConfig(value)
  if (!content) {
    return null
  }

  return {
    content,
    fileName: buildWireGuardDownloadFileName(value),
  }
}

export const encodeSubscriptionContentToBase64 = (content: string) => {
  const bytes = new TextEncoder().encode(content)
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  return btoa(binary)
}

export const prepareSubscriptionContentForCopy = (content: string) => {
  const configLines = content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  if (configLines.length === 0 || !configLines.every(isWireGuardConfigUrl)) {
    return {
      content,
      downloadFileName: null,
      isWireGuard: false,
    }
  }

  const convertedConfigs = configLines
    .map(convertWireGuardUrlToConfig)
    .filter((value): value is string => Boolean(value))

  if (convertedConfigs.length !== configLines.length) {
    return {
      content,
      downloadFileName: null,
      isWireGuard: false,
    }
  }

  return {
    content: convertedConfigs.join('\n\n'),
    downloadFileName: configLines.length === 1 ? buildWireGuardDownloadFileName(configLines[0]) : 'wireguard.conf',
    isWireGuard: true,
  }
}

export const downloadTextFile = (content: string, fileName: string, mimeType = TEXT_FILE_MIME_TYPE) => {
  const blob = new Blob([content], { type: mimeType })
  const downloadUrl = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = downloadUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  window.URL.revokeObjectURL(downloadUrl)
}
