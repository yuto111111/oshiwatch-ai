FROM python:3.12-slim

WORKDIR /app

# nemoguardrails が依存する annoy (C 拡張) ビルドに必要なパッケージ。
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
  && apt-get purge -y build-essential python3-dev \
  && apt-get autoremove -y

COPY src ./src

CMD ["python", "-m", "src.jobs.run_all"]
