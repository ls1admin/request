{{/* Expand the chart name. */}}
{{- define "aet-request.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Create a default fully qualified app name. */}}
{{- define "aet-request.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/* Chart name and version. */}}
{{- define "aet-request.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Common labels. */}}
{{- define "aet-request.labels" -}}
helm.sh/chart: {{ include "aet-request.chart" . }}
{{ include "aet-request.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/* Selector labels. */}}
{{- define "aet-request.selectorLabels" -}}
app.kubernetes.io/name: {{ include "aet-request.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/* Service account name */}}
{{- define "aet-request.serviceAccountName" -}}
default
{{- end -}}

{{/* Client resource names */}}
{{- define "aet-request.client.fullname" -}}
{{- printf "%s-client" (include "aet-request.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Server resource names */}}
{{- define "aet-request.server.fullname" -}}
{{- printf "%s-server" (include "aet-request.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* PostgreSQL service fullname */}}
{{- define "aet-request.postgresql.fullname" -}}
{{- if .Values.postgresql.fullnameOverride -}}
{{- .Values.postgresql.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-postgresql" (include "aet-request.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{/* Database URL with override support */}}
{{- define "aet-request.databaseUrl" -}}
{{- if .Values.server.secrets.databaseUrl -}}
{{- .Values.server.secrets.databaseUrl -}}
{{- else -}}
{{- $host := include "aet-request.postgresql.fullname" . -}}
{{- $port := "5432" -}}
{{- $user := .Values.postgresql.auth.username -}}
{{- $pass := .Values.postgresql.auth.password -}}
{{- $db := .Values.postgresql.auth.database -}}
{{- printf "postgresql+asyncpg://%s:%s@%s:%s/%s" $user $pass $host $port $db -}}
{{- end -}}
{{- end -}}
