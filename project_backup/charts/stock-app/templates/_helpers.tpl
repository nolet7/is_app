{{/*
Expand the name of the chart.
*/}}
{{- define "stock-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "stock-app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "stock-app.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "stock-app.labels" -}}
helm.sh/chart: {{ include "stock-app.chart" . }}
{{ include "stock-app.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- with .Values.global.labels }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "stock-app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "stock-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "stock-app.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "stock-app.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Generate image name
*/}}
{{- define "stock-app.image" -}}
{{- $registry := .Values.global.imageRegistry -}}
{{- $repository := .repository -}}
{{- $tag := .tag | default .Values.global.imageTag -}}
{{- printf "%s/%s:%s" $registry $repository $tag -}}
{{- end }}

{{/*
Generate common environment variables
*/}}
{{- define "stock-app.commonEnv" -}}
- name: NODE_ENV
  value: {{ .Values.global.env | quote }}
- name: ENVIRONMENT
  value: {{ .Values.global.env | quote }}
{{- end }}

{{/*
Generate microservice selector labels
*/}}
{{- define "stock-app.microserviceLabels" -}}
{{- $serviceName := .serviceName -}}
{{- $version := .version -}}
app: {{ $serviceName }}
version: {{ $version }}
{{ include "stock-app.selectorLabels" . }}
{{- end }}

{{/*
Generate microservice deployment name
*/}}
{{- define "stock-app.microserviceDeploymentName" -}}
{{- $serviceName := .serviceName -}}
{{- $version := .version -}}
{{- printf "%s-%s" $serviceName $version -}}
{{- end }}

{{/*
Generate service URL for microservice
*/}}
{{- define "stock-app.serviceUrl" -}}
{{- $serviceName := .serviceName -}}
{{- $port := .port -}}
{{- printf "http://%s-service:%d" $serviceName $port -}}
{{- end }}