# ETH Red Packet DApp

一个基于以太坊的链上红包应用，支持平均分配和随机金额两种模式。

## 项目结构

```
packages/
├── contract/   # Solidity 智能合约（Foundry）
├── frontend/   # Next.js 前端（部署在 Cloudflare Pages）
└── subgraph/   # The Graph 子图（索引合约事件）
```

## 功能

- **发红包**：存入 ETH，设置份数，选择平均或随机模式
- **抢红包**：通过红包 ID 领取，每个地址只能领一次
- **查看记录**：通过 The Graph 子图查询所有红包和领取历史

## 合约

- **网络**：Sepolia 测试网
- **合约地址**：`0xc2F536F5746c812EA681F6b60fBB2EA0cf42E8fD`
- **起始区块**：9711635

### 核心方法

```solidity
// 创建红包，msg.value 为总金额
function createPacket(uint256 _count, PacketType _type) external payable

// 领取红包
function claimPacket(bytes32 _id) external

// 查看红包详情
function getPacketDetails(bytes32 _id) external view returns (Packet memory)
```

### 红包类型

| 类型 | 说明 |
|------|------|
| `Equal` | 每人领取金额相同 |
| `Random` | 随机金额，范围为 1 ~ 2 倍平均值 |

## 本地开发

### 合约（Foundry）

```bash
cd packages/contract

# 安装依赖
forge install

# 运行测试
forge test

# 部署到 Sepolia
PRIVATE_KEY=<your_key> forge script script/Deploy.s.sol --rpc-url sepolia --broadcast
```

### 前端（Next.js）

```bash
cd packages/frontend/red-packet-frontend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建（Cloudflare Pages）
pnpm pages:build
```

前端依赖：RainbowKit · wagmi · viem · urql · Next.js 15

### 子图（The Graph）

```bash
cd packages/subgraph/red-packet-subgraph

# 安装依赖
yarn install

# 本地启动（需要 Docker）
docker-compose up
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 智能合约 | Solidity ^0.8.19 · Foundry |
| 前端 | Next.js 15 · TypeScript · RainbowKit · wagmi · viem |
| 数据索引 | The Graph · AssemblyScript |
| 部署 | Cloudflare Pages |
