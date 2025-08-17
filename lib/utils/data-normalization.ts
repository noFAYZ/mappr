export class DataNormalizer {
  static normalizePortfolio(portfolio: any): any {
    return {
      totalValue: portfolio?.totalValue || 0,
      dayChange: portfolio?.dayChange || 0,
      dayChangePercent: portfolio?.dayChangePercent || 0,
      positions: portfolio?.positions || [],
      chains: portfolio?.chains || [],
      lastUpdated: new Date().toISOString(),
    };
  }

  static normalizePositions(positions: any[]): any[] {
    if (!Array.isArray(positions)) return [];

    return positions.map((position) => ({
      id: position.id,
      type: position.type || "position",
      attributes: {
        name: position.attributes?.fungible_info?.name || "Unknown Token",
        symbol: position.attributes?.fungible_info?.symbol || "N/A",
        value: position.attributes?.value || 0,
        quantity: position.attributes?.quantity || "0",
        price: position.attributes?.price || 0,
        change24h: position.attributes?.changes?.percent_1d || 0,
        icon: position.attributes?.fungible_info?.icon?.url,
        chain: position.relationships?.chain?.data?.id,
        protocol: position.relationships?.protocol?.data?.id,
        verified: position.attributes?.fungible_info?.flags?.verified || false,
      },
      metadata: {
        normalized: true,

        normalizedAt: new Date().toISOString(),
      },
    }));
  }

  static normalizeTransactions(transactions: any[]): any[] {
    if (!Array.isArray(transactions)) return [];
  
    return transactions.map((tx) => {
      const attributes = tx.attributes || {};
      const transfers = attributes.transfers || [];
      const approvals = attributes.approvals || [];
      const fee = attributes.fee || {};
      const acts = attributes.acts || [];
      const applicationMetadata = attributes.application_metadata || {};
      
      // Extract primary transfer value and direction
      const primaryTransfer = transfers[0] || {};
      const transferValue = primaryTransfer.quantity?.float || primaryTransfer.quantity?.numeric || 0;
      const transferDirection = primaryTransfer.direction || 'unknown';
      
      // Extract token/NFT information
      const tokenInfo = primaryTransfer.fungible_info || primaryTransfer.nft_info || {};
      const isNFT = !!primaryTransfer.nft_info;
      
      // Calculate total value (including fee)
      const feeValue = fee.quantity?.float || fee.quantity?.numeric || 0;
      const feePrice = fee.price || null;
      const feeUsdValue = fee.value || null;
      const totalValue = Math.abs(transferValue) + feeValue;
      
      // Extract DApp information
      const dapp = tx.relationships?.dapp?.data || null;
      
      return {
        id: tx.id,
        type: tx.type || "transactions",
        attributes: {
          hash: attributes.hash,
          operationType: attributes.operation_type,
          status: attributes.status || "confirmed",
          timestamp: attributes.mined_at || attributes.sent_at,
          blockNumber: attributes.mined_at_block,
          nonce: attributes.nonce,
          sentFrom: attributes.sent_from,
          sentTo: attributes.sent_to,
          
          // Fee information with pricing
          fee: {
            amount: feeValue,
            currency: fee.fungible_info?.symbol || 'ETH',
            price: feePrice,
            value: feeUsdValue,
            details: fee
          },
          
          // Transfer information
          value: totalValue,
          transferValue: transferValue,
          direction: transferDirection,
          currency: tokenInfo.symbol || 'ETH',
          
          // Asset information
          asset: {
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            address: tokenInfo.contract_address || primaryTransfer.recipient,
            decimals: tokenInfo.decimals || primaryTransfer.quantity?.decimals,
            isNFT: isNFT,
            tokenId: isNFT ? tokenInfo.token_id : null,
            verified: tokenInfo.flags?.verified || false,
            icon: tokenInfo.icon?.url || tokenInfo.content?.preview?.url,
            interface: tokenInfo.interface || null
          },
          
          // Application/Protocol information
          application: {
            name: applicationMetadata.name || null,
            icon: applicationMetadata.icon?.url || null,
            contractAddress: applicationMetadata.contract_address || null,
            method: applicationMetadata.method || null,
            dapp: dapp ? {
              type: dapp.type,
              id: dapp.id
            } : null
          },
          
          // Transaction acts/actions with metadata
          actions: acts.map(act => ({
            id: act.id,
            type: act.type,
            applicationMetadata: act.application_metadata || null
          })),
          
          // All transfers in the transaction with pricing
          transfers: transfers.map(transfer => ({
            direction: transfer.direction,
            quantity: transfer.quantity?.numeric || transfer.quantity?.float || 0,
            quantityDetails: transfer.quantity || {},
            recipient: transfer.recipient,
            sender: transfer.sender,
            asset: transfer.fungible_info?.symbol || transfer.nft_info?.name || 'Unknown',
            assetInfo: transfer.fungible_info || transfer.nft_info || null,
            isNFT: !!transfer.nft_info,
            tokenId: transfer.nft_info?.token_id || null,
            actId: transfer.act_id,
            price: transfer.price || null,
            value: transfer.value || null
          })),
          
          // Approvals information
          approvals: approvals.map(approval => ({
            asset: approval.fungible_info?.symbol || 'Unknown',
            assetInfo: approval.fungible_info || null,
            quantity: approval.quantity?.numeric || approval.quantity?.float || 0,
            quantityDetails: approval.quantity || {},
            sender: approval.sender,
            actId: approval.act_id
          })),
          
          // Flags
          isTrash: attributes.flags?.is_trash || false,
          
          // Chain information
          chain: tx.relationships?.chain?.data?.id || 'ethereum',
          chainLinks: tx.relationships?.chain?.links || null
        },
        relationships: {
          chain: tx.relationships?.chain || null,
          dapp: tx.relationships?.dapp || null
        },
        metadata: {
          normalized: true,
          normalizedAt: new Date().toISOString(),
          originalData: {
            transfersCount: transfers.length,
            approvalsCount: approvals.length,
            actsCount: acts.length,
            hasApplicationMetadata: !!applicationMetadata.name,
            hasDapp: !!dapp,
            hasNFTs: transfers.some(t => !!t.nft_info)
          }
        }
      };
    });
  }

  static normalizeNFTs(nfts: any): any {
    if (!nfts || !nfts.data) return { items: [], totalCount: 0 };

    return {
      items: nfts.data.map((nft: any) => ({
        id: nft.id,
        type: nft.type || "nft",
        attributes: {
          name: nft.attributes?.name || "Unnamed NFT",
          description: nft.attributes?.description,
          image: nft.attributes?.preview?.url || nft.attributes?.content?.url,
          collection: nft.attributes?.collection?.name,
          tokenId: nft.attributes?.token_id,
          value: nft.attributes?.floor_price || 0,
          chain: nft.relationships?.chain?.data?.id,
        },
        metadata: {
          normalized: true,

          normalizedAt: new Date().toISOString(),
        },
      })),
      totalCount: nfts.data.length,
      metadata: {
        normalized: true,
        normalizedAt: new Date().toISOString(),
      },
    };
  }

  static normalizeChartData(chartData: any[]): any[] {
    if (!Array.isArray(chartData.points)) return [];

    return chartData?.points.map((point) => ({
      timestamp: point.timestamp || point[0],
      value: point.value || point[1] || 0,
    }));
  }
}
