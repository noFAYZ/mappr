export class DataNormalizer {
    static normalizePortfolio(portfolio: any): any {
      return {
        totalValue: portfolio?.totalValue || 0,
        dayChange: portfolio?.dayChange || 0,
        dayChangePercent: portfolio?.dayChangePercent || 0,
        positions: portfolio?.positions || [],
        chains: portfolio?.chains || [],
        lastUpdated: new Date().toISOString()
      };
    }
  
    static normalizePositions(positions: any[]): any[] {
      if (!Array.isArray(positions)) return [];
  
      return positions.map(position => ({
        id: position.id,
        type: position.type || 'position',
        attributes: {
          name: position.attributes?.fungible_info?.name || 'Unknown Token',
          symbol: position.attributes?.fungible_info?.symbol || 'N/A',
          value: position.attributes?.value || 0,
          quantity: position.attributes?.quantity || '0',
          price: position.attributes?.price || 0,
          change24h: position.attributes?.changes?.percent_1d || 0,
          icon: position.attributes?.fungible_info?.icon?.url,
          chain: position.relationships?.chain?.data?.id,
          protocol: position.relationships?.protocol?.data?.id,
          verified: position.attributes?.fungible_info?.flags?.verified || false,
        },
        metadata: {
          normalized: true,
         
          normalizedAt: new Date().toISOString()
        }
      }));
    }
  
    static normalizeTransactions(transactions: any[]): any[] {
      if (!Array.isArray(transactions)) return [];
  
      return transactions.map(tx => ({
        id: tx.id,
        type: tx.type || 'transaction',
        attributes: {
          hash: tx.attributes?.hash,
          status: tx.attributes?.status || 'confirmed',
          timestamp: tx.attributes?.mined_at || tx.attributes?.sent_at,
          blockNumber: tx.attributes?.block_number,
          gasUsed: tx.attributes?.gas_used,
          gasPrice: tx.attributes?.gas_price,
          fee: tx.attributes?.fee,
          value: tx.attributes?.sent_amount || tx.attributes?.received_amount || 0,
          direction: tx.attributes?.direction || 'unknown',
          chain: tx.relationships?.chain?.data?.id
        },
        metadata: {
          normalized: true,
          
          normalizedAt: new Date().toISOString()
        }
      }));
    }
  
    static normalizeNFTs(nfts: any): any {
      if (!nfts || !nfts.data) return { items: [], totalCount: 0 };
  
      return {
        items: nfts.data.map((nft: any) => ({
          id: nft.id,
          type: nft.type || 'nft',
          attributes: {
            name: nft.attributes?.name || 'Unnamed NFT',
            description: nft.attributes?.description,
            image: nft.attributes?.preview?.url || nft.attributes?.content?.url,
            collection: nft.attributes?.collection?.name,
            tokenId: nft.attributes?.token_id,
            value: nft.attributes?.floor_price || 0,
            chain: nft.relationships?.chain?.data?.id
          },
          metadata: {
            normalized: true,
      
            normalizedAt: new Date().toISOString()
          }
        })),
        totalCount: nfts.data.length,
        metadata: {
          normalized: true,
          normalizedAt: new Date().toISOString()
        }
      };
    }
  
    static normalizeChartData(chartData: any[]): any[] {
      if (!Array.isArray(chartData.points)) return [];
  
      return chartData?.points.map(point => ({
        timestamp: point.timestamp || point[0],
        value: point.value || point[1] || 0,

      }));
    }
  }