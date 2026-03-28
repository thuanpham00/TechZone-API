# Cẩm nang CI/CD cơ bản

Flow cơ bản làm việc với CI/CD

Code ở dưới local push lên Github -> Github action sẽ tiến hành build image và đẩy image lên docker hub -> Server sẽ kéo image từ docker hub về và chạy

## 1. Đăng ký tài khoản trên docker hub

### Đăng nhập docker hub trên terminal

```bash
docker login
```

Hoặc đăng nhập nhanh bằng cách

```bash
docker login -u <username> -p <password>
```

### Đẩy image lên docker hub

Đối với image khác tên

```bash
docker tag local-image:tagname new-repo:tagname
docker push new-repo:tagname
```

### Kéo image về local

```bash
docker pull new-repo:tagname
```

> Image mà được build ở mỗi máy tính sẽ có sự khác nhau. Có thể sẽ không chạy được trên máy khác.
> Ví dụ: Image được build trên máy Macbook M2 dùng chip **ARM**, sẽ không chạy được trên máy ubuntu dùng chip **Intel (hoặc AMD)**

## 2. Docker compose

## 3. Github action

Tạo file `.github/workflows/docker-image.yml`

Nội dung tương tự như sau

```yaml
name: Docker Image CI

on:
  push:
    branches: ['main']
  pull_request:
    branches: ['main']

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./Twitter
    steps:
      - uses: actions/checkout@v3
      - name: 'Create env file'
        run: echo "${{ secrets.TWITTER_ENV_PRODUCTION }}" > .env.production
      - name: Build the Docker image
        run: docker build --progress=plain -t duthanhduoc/twitter:v4 .
      - name: Log in to Docker Hub
        run: docker login -u ${{ secrets.DOCKERHUB_USERNAME }} -p ${{ secrets.DOCKERHUB_PASSWORD }}
      - name: Push the Docker image
        run: docker push duthanhduoc/twitter:v4
```

Muôn tên image động thì cập nhật lại 1 tí như ở phía dưới

```yaml
name: Docker Image CI

on:
  push:
    branches: ['main']
  pull_request:
    branches: ['main']

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./Twitter
    steps:
      - uses: actions/checkout@v3
      - name: 'Create env file'
        run: echo "${{ secrets.TWITTER_ENV_PRODUCTION }}" > .env.production
      - name: Build the Docker image
        run: |
          IMAGE_TAG=duthanhduoc/twitter:$(date +%s)
          docker build . --file Dockerfile --tag $IMAGE_TAG
          echo "::set-output name=image_tag::$IMAGE_TAG"
        id: build
      - name: Log in to Docker Hub
        run: docker login -u ${{ secrets.DOCKERHUB_USERNAME }} -p ${{ secrets.DOCKERHUB_PASSWORD }}
      - name: Push Docker image to Docker Hub
        run: docker push ${{ steps.build.outputs.image_tag }}
```

## 4. Setup VPS

### Cài docker trên ubuntu server

[Cài đặt docker trên ubuntu](https://docs.docker.com/engine/install/ubuntu/)

Fix lỗi trên ubuntu server

[Lỗi khi gõ `docker version` thì click vào đây](https://docs.docker.com/engine/install/linux-postinstall/)

### Để ssh vào server

```bash
ssh -i ~/.ssh/id_duthanhduoc duoc@207.148.118.147
```