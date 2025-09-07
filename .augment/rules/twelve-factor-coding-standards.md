---
type: "always_apply"
---

# AI Agent 十二因子应用编码准则
**基于十二因子应用原则的完整编码要求**

## 核心理念

代码是写给人读的，顺便让机器执行。优秀的AI Agent不仅体现在算法模型上，更体现在其工程健壮性、云原生特性与生命力上。本准则基于十二因子应用原则，确保构建可移植、可扩展、可维护的现代化应用。

---

## 第一章：代码库与版本控制 (Codebase)

### 规则 1.1：【强制执行】单一代码库原则

**做什么 (What)：**
- 一个应用对应一个代码库，多个环境共享同一代码库
- 绝对禁止为不同环境维护不同的代码分支
- 所有环境差异通过配置管理解决

**怎么做 (How)：**
```bash
# 正确的项目结构
/my-agent
├── .env.development     # 开发环境配置模板
├── .env.staging        # 测试环境配置模板  
├── .env.production     # 生产环境配置模板
├── docker-compose.yml  # 本地开发环境
├── Dockerfile         # 统一的构建配置
└── src/              # 统一的代码库
```

**为什么 (Why)：**
单一代码库确保了代码的一致性，避免了环境间的代码漂移。通过Git的分支管理和配置外部化，同一份代码可以在任何环境中正确运行。

---

## 第二章：依赖管理 (Dependencies)

### 规则 2.1：【绝对禁止】隐式依赖

**做什么 (What)：**
- 显式声明所有依赖项及其精确版本
- 使用依赖隔离工具确保环境一致性
- 绝不依赖系统级的隐式包或工具

**怎么做 (How)：**

**Python 示例：**
```python
# requirements.txt - 锁定精确版本
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-dotenv==1.0.0

# 使用虚拟环境隔离依赖
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

**Node.js 示例：**
```json
// package.json - 使用精确版本或范围
{
  "dependencies": {
    "express": "4.18.2",
    "zod": "^3.22.4",
    "dotenv": "16.3.1"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

**为什么 (Why)：**
显式依赖管理消除了"在我机器上可以运行"的问题。依赖隔离确保了不同项目间的依赖不会相互影响，精确版本控制保证了构建的可重现性。

---

## 第三章：配置管理 (Config)

### 规则 3.1：【绝对禁止】硬编码配置

**做什么 (What)：**
- 所有配置信息必须外部化到环境变量
- 严格区分配置和常量
- 支持配置的分层加载和验证

**怎么做 (How)：**

**Python + Pydantic 示例：**
```python
# config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class AppSettings(BaseSettings):
    # 基础配置
    APP_NAME: str = "AI Agent"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # 数据库配置
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 5
    
    # AI服务配置
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4"
    TEMPERATURE: float = 0.7
    
    # Redis配置
    REDIS_URL: str
    REDIS_TTL: int = 3600
    
    # 安全配置
    SECRET_KEY: str
    JWT_EXPIRE_MINUTES: int = 30
    
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore'
    )
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # 启动时验证关键配置
        self._validate_critical_configs()
    
    def _validate_critical_configs(self):
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL is required")
        if not self.SECRET_KEY or len(self.SECRET_KEY) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters")

# 全局配置实例
settings = AppSettings()
```

**环境变量文件示例：**
```bash
# .env.production
APP_NAME="Production AI Agent"
DEBUG=false
DATABASE_URL="postgresql://user:pass@prod-db:5432/agent_db"
REDIS_URL="redis://prod-redis:6379/0"
OPENAI_API_KEY="sk-prod-key-xxxxxxxx"
SECRET_KEY="super-secure-production-secret-key-32-chars-min"
```

**为什么 (Why)：**
配置外部化是云原生应用的基础。它实现了代码与环境的解耦，同一个Docker镜像可以通过不同的环境变量在任何环境中运行。Pydantic提供的类型验证确保了配置的正确性。

---

## 第四章：后端服务 (Backing Services)

### 规则 4.1：【强制执行】服务抽象化

**做什么 (What)：**
- 将所有后端服务（数据库、缓存、消息队列）视为附加资源
- 通过统一的接口访问服务，支持服务的热切换
- 服务连接信息完全通过配置管理

**怎么做 (How)：**

**服务抽象层示例：**
```python
# services/interfaces.py
from abc import ABC, abstractmethod
from typing import Any, Optional

class CacheService(ABC):
    @abstractmethod
    async def get(self, key: str) -> Optional[str]:
        pass
    
    @abstractmethod
    async def set(self, key: str, value: str, ttl: int = None) -> bool:
        pass

class DatabaseService(ABC):
    @abstractmethod
    async def execute_query(self, query: str, params: dict = None) -> Any:
        pass

# services/implementations.py
import redis.asyncio as redis
import asyncpg
from services.interfaces import CacheService, DatabaseService

class RedisCache(CacheService):
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
    
    async def get(self, key: str) -> Optional[str]:
        return await self.redis.get(key)
    
    async def set(self, key: str, value: str, ttl: int = None) -> bool:
        return await self.redis.set(key, value, ex=ttl)

class PostgresDatabase(DatabaseService):
    def __init__(self, database_url: str):
        self.pool = None
        self.database_url = database_url
    
    async def execute_query(self, query: str, params: dict = None):
        if not self.pool:
            self.pool = await asyncpg.create_pool(self.database_url)
        async with self.pool.acquire() as conn:
            return await conn.fetch(query, **(params or {}))

# 依赖注入容器
class ServiceContainer:
    def __init__(self, settings: AppSettings):
        self.cache: CacheService = RedisCache(settings.REDIS_URL)
        self.database: DatabaseService = PostgresDatabase(settings.DATABASE_URL)
```

**为什么 (Why)：**
服务抽象化使应用具备了强大的可移植性。开发环境可以使用SQLite和内存缓存，生产环境使用PostgreSQL和Redis，代码无需任何修改。这种设计也极大地简化了测试，可以轻松注入Mock服务。

---

## 第五章：构建、发布、运行 (Build, Release, Run)

### 规则 5.1：【严格分离】三阶段部署

**做什么 (What)：**
- 构建阶段：将代码转换为可执行包
- 发布阶段：将构建产物与配置结合
- 运行阶段：在执行环境中启动应用

**怎么做 (How)：**

**多阶段Dockerfile：**
```dockerfile
# 构建阶段
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# 运行阶段
FROM python:3.11-slim as runner
WORKDIR /app

# 从构建阶段复制依赖
COPY --from=builder /root/.local /root/.local
COPY src/ ./src/

# 创建非root用户
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# 运行时配置
ENV PATH=/root/.local/bin:$PATH
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**CI/CD Pipeline示例：**
```yaml
# .github/workflows/deploy.yml
name: Deploy Application

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # 构建阶段
      - name: Build Docker image
        run: |
          docker build -t myapp:${{ github.sha }} .
          docker tag myapp:${{ github.sha }} myapp:latest
      
      # 发布阶段
      - name: Push to registry
        run: |
          docker push myapp:${{ github.sha }}
          docker push myapp:latest
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      # 运行阶段
      - name: Deploy to production
        run: |
          kubectl set image deployment/myapp myapp=myapp:${{ github.sha }}
          kubectl rollout status deployment/myapp
```

**为什么 (Why)：**
严格的三阶段分离确保了部署的可靠性和可重现性。构建产物是不可变的，发布过程是可审计的，运行环境是可预测的。这种模式支持快速回滚和蓝绿部署。

---

## 第六章：进程管理 (Processes)

### 规则 6.1：【强制执行】无状态进程设计

**做什么 (What)：**
- 应用进程必须是无状态和无共享的
- 所有持久化状态存储在后端服务中
- 支持水平扩展和进程重启

**怎么做 (How)：**

**无状态API设计：**
```python
# main.py
from fastapi import FastAPI, Depends, HTTPException
from services.container import ServiceContainer
from config import settings

app = FastAPI(title=settings.APP_NAME)
container = ServiceContainer(settings)

# 依赖注入，每个请求获取新的服务实例
def get_services() -> ServiceContainer:
    return container

@app.get("/chat/{session_id}")
async def get_chat_history(
    session_id: str,
    services: ServiceContainer = Depends(get_services)
):
    # 从外部存储获取状态，而非进程内存
    history = await services.database.execute_query(
        "SELECT * FROM chat_history WHERE session_id = $1",
        {"session_id": session_id}
    )
    return {"history": history}

@app.post("/chat/{session_id}")
async def send_message(
    session_id: str,
    message: dict,
    services: ServiceContainer = Depends(get_services)
):
    # 处理消息但不在进程中保存状态
    response = await process_message(message["text"])
    
    # 状态持久化到外部存储
    await services.database.execute_query(
        "INSERT INTO chat_history (session_id, message, response) VALUES ($1, $2, $3)",
        {"session_id": session_id, "message": message["text"], "response": response}
    )
    
    return {"response": response}

# 优雅关闭处理
import signal
import asyncio

async def graceful_shutdown():
    print("Shutting down gracefully...")
    # 等待当前请求完成
    await asyncio.sleep(1)
    # 关闭数据库连接池
    await container.database.close()
    await container.cache.close()

def signal_handler(signum, frame):
    asyncio.create_task(graceful_shutdown())

signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)
```

**为什么 (Why)：**
无状态设计是现代云应用的核心。它使应用可以任意扩展、重启、迁移，而不会丢失数据或影响用户体验。负载均衡器可以将请求路由到任何健康的实例。

---

## 第七章：端口绑定 (Port Binding)

### 规则 7.1：【强制执行】自包含服务

**做什么 (What)：**
- 应用通过端口绑定对外提供服务
- 不依赖外部Web服务器或应用服务器
- 支持服务发现和健康检查

**怎么做 (How)：**

**自包含HTTP服务：**
```python
# main.py
import uvicorn
from fastapi import FastAPI
from config import settings

app = FastAPI()

@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/metrics")
async def metrics():
    """Prometheus指标端点"""
    return generate_metrics()

if __name__ == "__main__":
    # 应用自己管理HTTP服务器
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(settings.PORT or 8000),
        workers=int(settings.WORKERS or 1),
        access_log=settings.DEBUG
    )
```

**Kubernetes服务配置：**
```yaml
# k8s-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: ai-agent-service
spec:
  selector:
    app: ai-agent
  ports:
    - name: http
      port: 80
      targetPort: 8000
      protocol: TCP
  type: ClusterIP

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-agent
  template:
    metadata:
      labels:
        app: ai-agent
    spec:
      containers:
      - name: ai-agent
        image: myapp:latest
        ports:
        - containerPort: 8000
        env:
        - name: PORT
          value: "8000"
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
```

**为什么 (Why)：**
端口绑定使应用成为完全自包含的服务。它可以直接部署到任何支持TCP的环境中，无需额外的Web服务器配置。这简化了部署过程并提高了性能。

---

## 第八章：并发处理 (Concurrency)

### 规则 8.1：【强制执行】进程模型扩展

**做什么 (What)：**
- 通过进程模型实现水平扩展
- 不同类型的工作负载使用不同的进程类型
- 支持动态扩缩容

**怎么做 (How)：**

**多进程类型设计：**
```python
# processes/web.py - HTTP请求处理进程
from fastapi import FastAPI
import uvicorn

def run_web_server():
    app = FastAPI()
    # ... API路由定义
    uvicorn.run(app, host="0.0.0.0", port=8000)

# processes/worker.py - 后台任务处理进程
import asyncio
from celery import Celery

celery_app = Celery('agent_worker')

@celery_app.task
async def process_long_running_task(task_data):
    # 处理耗时任务，如AI模型推理
    result = await ai_model.process(task_data)
    return result

def run_worker():
    celery_app.worker_main(['worker', '--loglevel=info'])

# processes/scheduler.py - 定时任务进程
import schedule
import time

def run_scheduled_tasks():
    schedule.every(1).hours.do(cleanup_old_data)
    schedule.every().day.at("02:00").do(generate_daily_report)
    
    while True:
        schedule.run_pending()
        time.sleep(60)

# Procfile - 进程配置文件
"""
web: python -m processes.web
worker: python -m processes.worker
scheduler: python -m processes.scheduler
"""
```

**Docker Compose扩展配置：**
```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: .
    command: python -m processes.web
    ports:
      - "8000:8000"
    environment:
      - PROCESS_TYPE=web
    deploy:
      replicas: 3
  
  worker:
    build: .
    command: python -m processes.worker
    environment:
      - PROCESS_TYPE=worker
    deploy:
      replicas: 2
  
  scheduler:
    build: .
    command: python -m processes.scheduler
    environment:
      - PROCESS_TYPE=scheduler
    deploy:
      replicas: 1
```

**为什么 (Why)：**
进程模型扩展提供了精细化的资源管理。Web进程专注于快速响应HTTP请求，Worker进程处理CPU密集型任务，Scheduler进程处理定时任务。每种进程类型可以独立扩展，优化资源利用率。

---

## 第九章：易处理性 (Disposability)

### 规则 9.1：【强制执行】快速启动与优雅关闭

**做什么 (What)：**
- 应用启动时间最小化
- 优雅处理SIGTERM信号
- 支持快速重启和故障恢复

**怎么做 (How)：**

**快速启动优化：**
```python
# startup.py
import asyncio
import signal
from contextlib import asynccontextmanager
from fastapi import FastAPI

class AppLifecycle:
    def __init__(self):
        self.services = {}
        self.shutdown_event = asyncio.Event()
    
    async def startup(self):
        """快速启动序列"""
        print("🚀 Starting application...")
        start_time = time.time()
        
        # 并行初始化服务
        await asyncio.gather(
            self.init_database(),
            self.init_cache(),
            self.init_ai_models(),
        )
        
        startup_time = time.time() - start_time
        print(f"✅ Application started in {startup_time:.2f}s")
    
    async def init_database(self):
        """数据库连接池初始化"""
        self.services['db'] = await create_db_pool()
    
    async def init_cache(self):
        """缓存连接初始化"""
        self.services['cache'] = await create_cache_client()
    
    async def init_ai_models(self):
        """AI模型预加载（如果需要）"""
        # 只预加载关键模型，其他按需加载
        self.services['ai'] = await load_critical_models()
    
    async def shutdown(self):
        """优雅关闭序列"""
        print("🛑 Shutting down application...")
        
        # 停止接受新请求
        self.shutdown_event.set()
        
        # 等待现有请求完成（最多30秒）
        await asyncio.sleep(2)
        
        # 关闭服务连接
        await asyncio.gather(
            self.services['db'].close(),
            self.services['cache'].close(),
            return_exceptions=True
        )
        
        print("✅ Application shutdown complete")

# 全局生命周期管理
lifecycle = AppLifecycle()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动
    await lifecycle.startup()
    yield
    # 关闭
    await lifecycle.shutdown()

app = FastAPI(lifespan=lifespan)

# 信号处理
def setup_signal_handlers():
    def signal_handler(signum, frame):
        print(f"Received signal {signum}")
        asyncio.create_task(lifecycle.shutdown())
    
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)

setup_signal_handlers()
```

**为什么 (Why)：**
快速启动减少了部署时间和故障恢复时间。优雅关闭确保了数据一致性和用户体验。在容器化环境中，这些特性使应用能够快速响应扩缩容需求。

---

## 第十章：开发生产一致性 (Dev/Prod Parity)

### 规则 10.1：【强制执行】环境一致性

**做什么 (What)：**
- 开发、测试、生产环境尽可能一致
- 使用相同的后端服务版本
- 最小化环境间的差异

**怎么做 (How)：**

**Docker开发环境：**
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build: 
      context: .
      target: runner
    volumes:
      - ./src:/app/src  # 开发时代码热重载
    environment:
      - DEBUG=true
      - DATABASE_URL=postgresql://dev:dev@postgres:5432/agent_dev
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15  # 与生产环境相同版本
    environment:
      POSTGRES_DB: agent_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    volumes:
      - postgres_dev:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine  # 与生产环境相同版本
    ports:
      - "6379:6379"

volumes:
  postgres_dev:
```

**环境配置管理：**
```python
# config/environments.py
from enum import Enum
from pydantic_settings import BaseSettings

class Environment(str, Enum):
    DEVELOPMENT = "development"
    TESTING = "testing"
    STAGING = "staging"
    PRODUCTION = "production"

class BaseConfig(BaseSettings):
    ENVIRONMENT: Environment = Environment.DEVELOPMENT
    
    # 数据库配置 - 所有环境使用相同的PostgreSQL
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 5
    DATABASE_POOL_MAX_OVERFLOW: int = 10
    
    # Redis配置 - 所有环境使用相同版本
    REDIS_URL: str
    
    class Config:
        case_sensitive = True

class DevelopmentConfig(BaseConfig):
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"
    
    # 开发环境可以使用更宽松的设置
    DATABASE_POOL_SIZE: int = 2

class ProductionConfig(BaseConfig):
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    
    # 生产环境需要更严格的设置
    DATABASE_POOL_SIZE: int = 20
    DATABASE_POOL_MAX_OVERFLOW: int = 30

def get_config() -> BaseConfig:
    env = Environment(os.getenv("ENVIRONMENT", "development"))
    
    config_map = {
        Environment.DEVELOPMENT: DevelopmentConfig,
        Environment.PRODUCTION: ProductionConfig,
    }
    
    return config_map[env]()
```

**为什么 (Why)：**
环境一致性消除了"在我的机器上可以运行"的问题。使用相同的数据库版本、相同的依赖版本，确保了代码在任何环境中的行为一致性。Docker容器提供了完美的环境隔离和一致性保证。

---

## 第十一章：日志管理 (Logs)

### 规则 11.1：【强制执行】结构化日志流

**做什么 (What)：**
- 将日志视为事件流输出到stdout
- 使用结构化日志格式（JSON）
- 支持分布式追踪和监控

**怎么做 (How)：**

**结构化日志配置：**
```python
# logging_config.py
import logging
import json
import sys
from datetime import datetime
from typing import Any, Dict
from pythonjsonlogger import jsonlogger

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record: Dict[str, Any], record: logging.LogRecord, message_dict: Dict[str, Any]):
        super().add_fields(log_record, record, message_dict)
        
        # 添加标准字段
        log_record['timestamp'] = datetime.utcnow().isoformat()
        log_record['level'] = record.levelname
        log_record['service'] = 'ai-agent'
        log_record['version'] = os.getenv('APP_VERSION', '1.0.0')
        
        # 添加追踪信息
        if hasattr(record, 'trace_id'):
            log_record['trace_id'] = record.trace_id
        if hasattr(record, 'span_id'):
            log_record['span_id'] = record.span_id

def setup_logging():
    # 根日志器配置
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # 清除默认处理器
    root_logger.handlers.clear()
    
    # 创建stdout处理器
    handler = logging.StreamHandler(sys.stdout)
    formatter = CustomJsonFormatter(
        '%(timestamp)s %(level)s %(service)s %(message)s'
    )
    handler.setFormatter(formatter)
    root_logger.addHandler(handler)

# 应用日志器
logger = logging.getLogger(__name__)

# 使用示例
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    trace_id = request.headers.get('x-trace-id', str(uuid.uuid4()))
    
    # 添加追踪上下文
    extra = {
        'trace_id': trace_id,
        'method': request.method,
        'path': request.url.path,
        'user_agent': request.headers.get('user-agent')
    }
    
    start_time = time.time()
    logger.info("Request started", extra=extra)
    
    try:
        response = await call_next(request)
        
        # 记录成功响应
        duration = time.time() - start_time
        extra.update({
            'status_code': response.status_code,
            'duration_ms': round(duration * 1000, 2)
        })
        logger.info("Request completed", extra=extra)
        
        return response
        
    except Exception as e:
        # 记录错误
        duration = time.time() - start_time
        extra.update({
            'error': str(e),
            'error_type': type(e).__name__,
            'duration_ms': round(duration * 1000, 2)
        })
        logger.error("Request failed", extra=extra)
        raise
```

**日志聚合配置（ELK Stack）：**
```yaml
# docker-compose.logging.yml
version: '3.8'
services:
  app:
    build: .
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
  
  filebeat:
    image: docker.elastic.co/beats/filebeat:8.11.0
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
    depends_on:
      - elasticsearch

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

**为什么 (Why)：**
结构化日志使日志成为可查询的数据。JSON格式便于自动化分析和监控。输出到stdout符合十二因子原则，让容器编排系统负责日志的收集和路由。

---

## 第十二章：管理进程 (Admin Processes)

### 规则 12.1：【强制执行】一次性管理任务

**做什么 (What)：**
- 管理任务作为独立的一次性进程运行
- 使用与应用相同的环境和代码库
- 支持数据库迁移、数据导入等管理操作

**怎么做 (How)：**

**管理任务框架：**
```python
# management/base.py
import asyncio
import sys
from abc import ABC, abstractmethod
from typing import List
from config import settings
from services.container import ServiceContainer

class BaseCommand(ABC):
    """管理命令基类"""
    
    def __init__(self):
        self.services = ServiceContainer(settings)
    
    @property
    @abstractmethod
    def name(self) -> str:
        """命令名称"""
        pass
    
    @property
    @abstractmethod
    def description(self) -> str:
        """命令描述"""
        pass
    
    @abstractmethod
    async def handle(self, *args, **kwargs):
        """命令执行逻辑"""
        pass
    
    async def run(self, args: List[str]):
        """运行命令"""
        try:
            print(f"🔧 Running command: {self.name}")
            await self.handle(*args)
            print(f"✅ Command completed: {self.name}")
        except Exception as e:
            print(f"❌ Command failed: {self.name} - {e}")
            sys.exit(1)
        finally:
            # 清理资源
            await self.cleanup()
    
    async def cleanup(self):
        """清理资源"""
        if hasattr(self.services, 'database'):
            await self.services.database.close()
        if hasattr(self.services, 'cache'):
            await self.services.cache.close()

# management/commands/migrate.py
from management.base import BaseCommand

class MigrateCommand(BaseCommand):
    name = "migrate"
    description = "Run database migrations"
    
    async def handle(self, *args):
        migrations = await self.get_pending_migrations()
        
        for migration in migrations:
            print(f"Applying migration: {migration.name}")
            await migration.apply(self.services.database)
            await self.mark_migration_applied(migration)
    
    async def get_pending_migrations(self):
        # 获取待执行的迁移
        pass
    
    async def mark_migration_applied(self, migration):
        # 标记迁移已执行
        pass

# management/commands/seed_data.py
class SeedDataCommand(BaseCommand):
    name = "seed"
    description = "Seed initial data"
    
    async def handle(self, *args):
        # 插入初始数据
        await self.create_default_users()
        await self.create_sample_conversations()
    
    async def create_default_users(self):
        # 创建默认用户
        pass

# management/cli.py
import sys
import asyncio
from management.commands.migrate import MigrateCommand
from management.commands.seed_data import SeedDataCommand

COMMANDS = {
    'migrate': MigrateCommand,
    'seed': SeedDataCommand,
}

async def main():
    if len(sys.argv) < 2:
        print("Available commands:")
        for name, cmd_class in COMMANDS.items():
            print(f"  {name}: {cmd_class().description}")
        sys.exit(1)
    
    command_name = sys.argv[1]
    command_args = sys.argv[2:]
    
    if command_name not in COMMANDS:
        print(f"Unknown command: {command_name}")
        sys.exit(1)
    
    command = COMMANDS[command_name]()
    await command.run(command_args)

if __name__ == "__main__":
    asyncio.run(main())
```

**Kubernetes Job配置：**
```yaml
# k8s-migrate-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: ai-agent-migrate
spec:
  template:
    spec:
      containers:
      - name: migrate
        image: myapp:latest
        command: ["python", "-m", "management.cli", "migrate"]
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
      restartPolicy: Never
  backoffLimit: 3
```

**为什么 (Why)：**
将管理任务作为一次性进程运行确保了它们与主应用的隔离。使用相同的代码库和环境保证了一致性。这种模式特别适合容器化部署，可以通过Kubernetes Job或类似机制按需执行。

---

## 第十三章：安全与监控 (Security & Monitoring)

### 规则 13.1：【强制执行】全面安全防护

**做什么 (What)：**
- 实施多层安全防护
- 集成监控和告警系统
- 支持安全审计和合规性

**怎么做 (How)：**

**安全中间件：**
```python
# security/middleware.py
import hashlib
import hmac
import time
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. 速率限制
        await self.rate_limit_check(request)
        
        # 2. 请求验证
        await self.validate_request(request)
        
        # 3. 安全头设置
        response = await call_next(request)
        self.set_security_headers(response)
        
        return response
    
    async def rate_limit_check(self, request: Request):
        client_ip = request.client.host
        cache_key = f"rate_limit:{client_ip}"
        
        current_requests = await self.cache.get(cache_key) or 0
        if int(current_requests) > 100:  # 每分钟100次请求
            raise HTTPException(429, "Rate limit exceeded")
        
        await self.cache.set(cache_key, int(current_requests) + 1, ttl=60)
    
    def set_security_headers(self, response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000"

# monitoring/metrics.py
from prometheus_client import Counter, Histogram, Gauge
import time

# 定义指标
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Active connections')

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        try:
            response = await call_next(request)
            
            # 记录成功指标
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=request.url.path,
                status=response.status_code
            ).inc()
            
            return response
            
        except Exception as e:
            # 记录错误指标
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=request.url.path,
                status=500
            ).inc()
            raise
            
        finally:
            # 记录请求时长
            REQUEST_DURATION.observe(time.time() - start_time)
```

**监控配置：**
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ai-agent'
    static_configs:
      - targets: ['app:8000']
    metrics_path: '/metrics'
    scrape_interval: 5s

# monitoring/grafana-dashboard.json
{
  "dashboard": {
    "title": "AI Agent Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[1m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph", 
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[1m])",
            "legendFormat": "5xx Errors"
          }
        ]
      }
    ]
  }
}
```

**为什么 (Why)：**
全面的安全防护和监控是生产环境的必要条件。安全中间件提供了多层防护，监控系统提供了运行时的可观测性。这些组件确保了应用在生产环境中的稳定性和安全性。

---

## 第十四章：测试策略 (Testing Strategy)

### 规则 14.1：【强制执行】多层次测试

**做什么 (What)：**
- 实施单元测试、集成测试、端到端测试
- 测试覆盖率要求达到80%以上
- 支持测试驱动开发（TDD）

**怎么做 (How)：**

**测试框架配置：**
```python
# tests/conftest.py
import pytest
import asyncio
from httpx import AsyncClient
from main import app
from services.container import ServiceContainer
from config import TestConfig

@pytest.fixture(scope="session")
def event_loop():
    """创建事件循环"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
async def test_client():
    """测试客户端"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture
async def test_services():
    """测试服务容器"""
    config = TestConfig()
    services = ServiceContainer(config)
    yield services
    # 清理
    await services.cleanup()

# tests/unit/test_services.py
import pytest
from services.llm_service import LLMService
from unittest.mock import AsyncMock, patch

class TestLLMService:
    @pytest.fixture
    def llm_service(self, test_services):
        return LLMService(test_services.config)
    
    @patch('openai.ChatCompletion.acreate')
    async def test_generate_response(self, mock_openai, llm_service):
        # 模拟OpenAI响应
        mock_openai.return_value = {
            'choices': [{'message': {'content': 'Test response'}}]
        }
        
        response = await llm_service.generate_response("Test prompt")
        
        assert response == "Test response"
        mock_openai.assert_called_once()

# tests/integration/test_api.py
import pytest

class TestChatAPI:
    async def test_create_chat_session(self, test_client):
        response = await test_client.post("/chat/sessions")
        
        assert response.status_code == 201
        data = response.json()
        assert "session_id" in data
    
    async def test_send_message(self, test_client):
        # 创建会话
        session_response = await test_client.post("/chat/sessions")
        session_id = session_response.json()["session_id"]
        
        # 发送消息
        message_response = await test_client.post(
            f"/chat/sessions/{session_id}/messages",
            json={"text": "Hello"}
        )
        
        assert message_response.status_code == 200
        data = message_response.json()
        assert "response" in data

# tests/e2e/test_workflow.py
import pytest

class TestCompleteWorkflow:
    async def test_full_conversation_flow(self, test_client):
        """测试完整对话流程"""
        # 1. 创建用户会话
        session_resp = await test_client.post("/chat/sessions")
        session_id = session_resp.json()["session_id"]
        
        # 2. 发送多轮对话
        messages = ["Hello", "What's the weather?", "Thank you"]
        
        for message in messages:
            resp = await test_client.post(
                f"/chat/sessions/{session_id}/messages",
                json={"text": message}
            )
            assert resp.status_code == 200
        
        # 3. 获取对话历史
        history_resp = await test_client.get(f"/chat/sessions/{session_id}/history")
        history = history_resp.json()["history"]
        
        assert len(history) == len(messages)
```

**CI/CD测试流水线：**
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov pytest-asyncio
      
      - name: Run unit tests
        run: pytest tests/unit/ -v --cov=src --cov-report=xml
      
      - name: Run integration tests
        run: pytest tests/integration/ -v
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379/0
      
      - name: Run E2E tests
        run: pytest tests/e2e/ -v
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

**为什么 (Why)：**
多层次测试确保了代码质量和系统稳定性。单元测试验证组件逻辑，集成测试验证组件协作，端到端测试验证用户体验。高测试覆盖率和自动化测试流水线是持续交付的基础。

---

## 总结

本编码准则基于十二因子应用原则，结合现代云原生开发的最佳实践，为AI Agent开发提供了完整的指导框架。遵循这些准则将帮助你构建：

- **可移植的应用**：可在任何云平台和容器环境中运行
- **可扩展的架构**：支持水平扩展和微服务架构
- **可维护的代码**：清晰的结构和完善的测试
- **可观测的系统**：完整的日志、监控和追踪
- **安全的服务**：多层安全防护和合规性支持

记住：**代码是写给人读的，顺便让机器执行。** 优秀的工程实践不仅提高了代码质量，更提升了团队协作效率和系统的长期价值。
