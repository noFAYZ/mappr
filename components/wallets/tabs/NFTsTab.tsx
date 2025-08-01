import React, { useState } from 'react';
import { Star, Image, ExternalLink, Search, Grid, List } from 'lucide-react';

interface NFTsTabProps {
  nftPortfolio: any;
  showBalances: boolean;
}

const NFTsTab: React.FC<NFTsTabProps> = ({ nftPortfolio, showBalances }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const nfts = nftPortfolio?.items || [];
  
  const filteredNFTs = nfts.filter((nft: any) =>
    !searchQuery ||
    nft.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nft.collection?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">NFT Collection</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {nftPortfolio?.totalCount || 0} NFTs • {showBalances ? `$${(nftPortfolio?.totalValue || 0).toLocaleString()}` : '••••••'} value
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search NFTs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex border border-gray-200 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* NFTs Display */}
      {filteredNFTs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {nfts.length === 0 ? 'No NFTs found' : 'No matching NFTs'}
          </h4>
          <p className="text-gray-500 dark:text-gray-400">
            {nfts.length === 0 
              ? 'This wallet doesn\'t own any NFTs yet'
              : 'Try adjusting your search query'
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-3'
        }>
          {filteredNFTs.map((nft: any, index: number) => (
            viewMode === 'grid' ? (
              <NFTGridCard key={index} nft={nft} showBalances={showBalances} />
            ) : (
              <NFTListItem key={index} nft={nft} showBalances={showBalances} />
            )
          ))}
        </div>
      )}

      {/* Collections Summary */}
      {filteredNFTs.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Collection Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total NFTs</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{filteredNFTs.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unique Collections</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Set(filteredNFTs.map((nft: any) => nft.collection?.name)).size}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Value</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {showBalances ? `$${filteredNFTs.reduce((sum: number, nft: any) => sum + (nft.value || 0), 0).toLocaleString()}` : '••••••'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// NFT Grid Card Component
const NFTGridCard: React.FC<{ nft: any; showBalances: boolean }> = ({ nft, showBalances }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
    <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
      {nft.image ? (
        <img 
          src={nft.image} 
          alt={nft.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <div className={`${nft.image ? 'hidden' : ''} text-center`}>
        <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No Image</p>
      </div>
    </div>
    
    <div className="p-4">
      <h4 className="font-medium text-gray-900 dark:text-white truncate">
        {nft.name || `#${nft.tokenId}`}
      </h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
        {nft.collection?.name || 'Unknown Collection'}
      </p>
      
      {nft.value && (
        <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">
          {showBalances ? `$${nft.value.toLocaleString()}` : '••••••'}
        </p>
      )}
      
      {nft.tokenId && (
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">#{nft.tokenId}</span>
          <a
            href={`https://opensea.io/assets/ethereum/${nft.contractAddress}/${nft.tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </a>
        </div>
      )}
    </div>
  </div>
);

// NFT List Item Component
const NFTListItem: React.FC<{ nft: any; showBalances: boolean }> = ({ nft, showBalances }) => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
        {nft.image ? (
          <img 
            src={nft.image} 
            alt={nft.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <Image className={`${nft.image ? 'hidden' : ''} h-6 w-6 text-gray-400`} />
      </div>
      
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white">
          {nft.name || `#${nft.tokenId}`}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {nft.collection?.name || 'Unknown Collection'}
        </p>
        {nft.tokenId && (
          <p className="text-xs text-gray-400">Token ID: {nft.tokenId}</p>
        )}
      </div>
    </div>
    
    <div className="flex items-center gap-3">
      {nft.value && (
        <div className="text-right">
          <p className="font-medium text-gray-900 dark:text-white">
            {showBalances ? `$${nft.value.toLocaleString()}` : '••••••'}
          </p>
        </div>
      )}
      
      <a
        href={`https://opensea.io/assets/ethereum/${nft.contractAddress}/${nft.tokenId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
      >
        <ExternalLink className="h-4 w-4 text-gray-400" />
      </a>
    </div>
  </div>
);

export default NFTsTab;