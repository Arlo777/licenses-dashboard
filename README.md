# DauArlo

CI/CD для развертывания веб-приложения в Kubernetes
Этот репозиторий содержит полный пример настройки автоматического развертывания (CI/CD) простого веб-приложения NGINX в кластер Kubernetes с помощью GitLab.

Пайплайн автоматически:

Собирает Docker-образ с вашим сайтом.

Загружает его в GitLab Container Registry.

Разворачивает новую версию приложения в Kubernetes.

⚙️ Что понадобится для запуска
Доступ к кластеру Kubernetes.

Установленный kubectl на вашем локальном компьютере для первоначальной настройки.

Установленный Ingress-контроллер в кластере (например, NGINX Ingress).

Проект в GitLab (куда вы загрузите этот код).

Доменное имя, которое будет указывать на ваш сайт.

🔑 Настройка
Чтобы пайплайн заработал, нужно один раз настроить связь между GitLab и вашим кластером Kubernetes.

Шаг 1: Подготовка Kubernetes
Сначала создадим в кластере специальную учётную запись (ServiceAccount) для GitLab и дадим ей необходимые права.

Создайте ServiceAccount, Role и RoleBinding.
Выполните эту команду на вашем локальном компьютере:

Bash

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: gitlab-ci-sa
  namespace: default
---
apiVersion: rbac.authorization.k разновидности v1
kind: Role
metadata:
  name: gitlab-ci-role
  namespace: default
rules:
- apiGroups: ["", "apps", "networking.k8s.io"]
  resources: ["deployments", "services", "pods", "ingresses"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: gitlab-ci-binding
  namespace: default
subjects:
- kind: ServiceAccount
  name: gitlab-ci-sa
  namespace: default
roleRef:
  kind: Role
  name: gitlab-ci-role
  apiGroup: rbac.authorization.k8s.io
EOF
Сгенерируйте токен для GitLab.
Этот токен будет использоваться пайплайном для доступа к кластеру.

Bash

kubectl create token gitlab-ci-sa -n default --duration=8760h
Сохраните этот токен, он понадобится на следующем шаге.

Шаг 2: Настройка переменных в GitLab
Теперь нужно передать данные для доступа к кластеру в GitLab в виде защищённых переменных.

В вашем проекте GitLab перейдите в Settings → CI/CD.

Найдите раздел Variables и нажмите Expand.

Создайте следующие переменные:

Key	Value	Protected	Masked
KUBE_SERVER	URL вашего Kubernetes API-сервера	Да	Да
KUBE_CA_DATA	Сертификат вашего кластера (Base64)	Да	Да
KUBE_TOKEN	Токен, который вы сгенерировали на Шаге 1	Да	Да
APP_HOST	Ваше доменное имя (например, arlanito.kz)	Да	Нет

Export to Sheets
Как получить KUBE_SERVER и KUBE_CA_DATA?
Выполните kubectl config view --minify на вашем компьютере, и вы увидите их в выводе.

Шаг 3: Настройка DNS
Убедитесь, что ваше доменное имя (APP_HOST) указывает на внешний IP-адрес вашего Ingress-контроллера.

Узнайте IP-адрес командой: kubectl get svc -n ingress-nginx

Создайте A-запись в настройках вашего домена, указывающую на этот IP.

🚀 Как это работает
Коммит в main: Любой git push в ветку main автоматически запускает пайплайн.

Этап build:

Запускается задача, которая находит Dockerfile.

Собирается Docker-образ, в который копируются файлы из папки html/.

Готовый образ загружается в GitLab Container Registry, привязанный к вашему проекту.

Этап deploy:

Задача подключается к вашему Kubernetes-кластеру, используя переменные, которые вы настроили.

Она применяет манифесты из папки kubernetes/, подставляя в них нужные переменные (например, имя образа из предыдущего шага и доменное имя).

Команда kubectl rollout status дожидается, пока новая версия приложения будет успешно развёрнута.

После этого ваш сайт обновлён и доступен по указанному доменному имени.

📁 Структура проекта
Убедитесь, что ваш проект имеет следующую структуру:

.
├── .gitlab-ci.yml      # Файл пайплайна
├── Dockerfile          # Инструкция для сборки Docker-образа
├── html/               # Папка с файлами вашего сайта
│   └── index.html
└── kubernetes/         # Папка с манифестами Kubernetes
    ├── deployment.yaml
    ├── service.yaml
    └── ingress.yaml
