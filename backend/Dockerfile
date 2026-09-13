FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements/ requirements/
RUN pip install --no-cache-dir --disable-pip-version-check -r requirements/production.txt \
    && useradd --create-home --shell /usr/sbin/nologin aurevia \
    && mkdir -p /app/staticfiles \
    && chown aurevia:aurevia /app/staticfiles

COPY --chown=aurevia:aurevia . .
USER aurevia

EXPOSE 8000

CMD ["sh", "-c", "python manage.py collectstatic --noinput --settings=config.settings.production && exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers ${WEB_CONCURRENCY:-2} --timeout 45 --access-logfile - --error-logfile - --log-level info"]
